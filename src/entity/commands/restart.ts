// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import InstanceSubsystem from "../../service/system_instance";

export default class RestartCommand extends InstanceCommand {
  constructor() {
    super("RestartCommand");
  }

  async exec(instance: Instance) {
    // If the automatic restart function is enabled, the setting is ignored once
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    // send restart command
    return await instance.execPreset("restart")
      .then(async function() {
        if (instance.config.eventTask.childInstanceRestart && instance.childInstance.length > 0) {
          for (const instanceUuid of instance.childInstance) {
            const instance = InstanceSubsystem.getInstance(instanceUuid);
            await instance.exec(new RestartCommand());
          }
        }
      });
  }
}
