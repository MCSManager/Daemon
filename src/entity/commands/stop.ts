// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import SendCommand from "./cmd";

export default class StopCommand extends InstanceCommand {
  constructor() {
    super("StopCommand");
  }

  async exec(instance: Instance) {
    // 若启用自动重启功能则设置忽略一次
    if (instance.config.eventTask && instance.config.eventTask.autoRestart) instance.config.eventTask.ignore = true;

    // 发送停止命令
    return await instance.execPreset("stop");
  }
}
