// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";

export default class RestartCommand extends InstanceCommand {
  constructor() {
    super("RestartCommand");
  }

  async exec(instance: Instance) {
    // 若启用自动重启功能则设置忽略一次
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    return await instance.execPreset("restart");
  }
}
