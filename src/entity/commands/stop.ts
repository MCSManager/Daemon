// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import InstanceSubsystem from "../../service/system_instance";

export default class StopCommand extends InstanceCommand {
  private readonly userInstances: string[];
  private readonly isTopPermission: boolean;

  constructor(userInstances: string[] = [], isTopPermission: boolean = false) {
    super("StopCommand");
    this.userInstances = userInstances;
    this.isTopPermission = isTopPermission;
  }

  async exec(instance: Instance) {
    // If the automatic restart function is enabled, the setting is ignored once
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    const userInstances = this.userInstances;
    const isTopPermission = this.isTopPermission;
    // send stop command
    return await instance.execPreset("stop")
      .then(async function() {
        if (instance.config.eventTask.childInstanceStop && instance.childInstance.length > 0) {
          const childInstanceList = instance.childInstance;
          instance.childInstance = [];
          for (const instanceUuid of childInstanceList) {
            if (isTopPermission || userInstances.includes(instanceUuid)) {
              const instance = InstanceSubsystem.getInstance(instanceUuid);
              await instance.exec(new StopCommand(userInstances, isTopPermission));
            }
          }
        }
      });
  }
}
