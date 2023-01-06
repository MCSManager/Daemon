// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../../i18n";
import Instance from "../instance/instance";
import logger from "../../service/log";
import fs from "fs-extra";

import InstanceCommand from "./base/command";
import * as childProcess from "child_process";
import FunctionDispatcher from "./dispatcher";
import { start } from "repl";
import InstanceSubsystem from "../../service/system_instance";
import StopCommand from "./stop";
import * as protocol from "../../service/protocol";

class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default class StartCommand extends InstanceCommand {
  public source: string;

  constructor(source = "Unknown") {
    super("StartCommand");
    this.source = source;
  }

  private async sleep() {
    return new Promise((ok) => {
      setTimeout(ok, 1000 * 3);
    });
  }

  async exec(instance: Instance) {
    if (instance.status() !== Instance.STATUS_STOP) return instance.failure(new StartupError($t("start.instanceNotDown")));
    try {
      instance.setLock(true);
      instance.status(Instance.STATUS_STARTING);
      instance.startCount++;

      // expiration time check
      const endTime = new Date(instance.config.endTime).getTime();
      if (endTime) {
        const currentTime = new Date().getTime();
        if (endTime <= currentTime) {
          throw new Error($t("start.instanceMaturity"));
        }
      }

      const currentTimestamp = new Date().getTime();
      instance.startTimestamp = currentTimestamp;

      instance.println("INFO", $t("start.startInstance"));

      // prevent the dead-loop from starting
      await this.sleep();

      return await instance.execPreset("start", this.source)
        .then(async function() {
          if (instance.config.eventTask.childInstanceStart && instance.config.eventTask.childInstance != "") {
            const childInstanceList = instance.config.eventTask.childInstance.split(",");
            for (const instanceUuid of childInstanceList) {
              const childInstance = InstanceSubsystem.getInstance(instanceUuid);
              if (childInstance.status() == Instance.STATUS_STOP) {
                instance.childInstance[instance.childInstance.length] = instanceUuid;
                await childInstance.exec(new StartCommand());
              }
            }
          }
        });
    } catch (error) {
      instance.releaseResources();
      instance.status(Instance.STATUS_STOP);
      instance.failure(error);
    } finally {
      instance.setLock(false);
    }
  }
}
