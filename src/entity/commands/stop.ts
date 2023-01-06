// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import SendCommand from "./cmd";
import InstanceSubsystem from "../../service/system_instance";

export default class StopCommand extends InstanceCommand {
  constructor() {
    super("StopCommand");
  }

  async exec(instance: Instance) {
    // If the automatic restart function is enabled, the setting is ignored once
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    // send stop command
    return await instance.execPreset("stop")
      .then(async function() {
        if (instance.config.eventTask.childInstanceStop && instance.childInstance.length > 0) {
          const childInstanceList = instance.childInstance;
          instance.childInstance = [];
          for (const instanceUuid of childInstanceList) {
            const instance = InstanceSubsystem.getInstance(instanceUuid);
            await instance.exec(new StopCommand());
          }
        }
      });
  }
}
