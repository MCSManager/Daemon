// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import InstanceSubsystem from "../../service/system_instance";

export default class RestartCommand extends InstanceCommand {
  private readonly userInstances: string[];
  private readonly isTopPermission: boolean;

  constructor(userInstances: string[] = [], isTopPermission: boolean = false) {
    super("RestartCommand");
    this.userInstances = userInstances;
    this.isTopPermission = isTopPermission;
  }

  async exec(instance: Instance) {
    // If the automatic restart function is enabled, the setting is ignored once
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    const userInstances = this.userInstances;
    const isTopPermission = this.isTopPermission;
    // send restart command
    return await instance.execPreset("restart")
      .then(async function() {
        if (instance.config.eventTask.childInstanceStop && instance.childInstance.length > 0) {
          const childInstanceList = instance.childInstance;
          instance.childInstance = [];
          for (const instanceUuid of childInstanceList) {
            if (isTopPermission || userInstances.includes(instanceUuid)) {
              const instance = InstanceSubsystem.getInstance(instanceUuid);
              await instance.exec(new RestartCommand(userInstances, isTopPermission));
            }
          }
        }
      });
  }
}
