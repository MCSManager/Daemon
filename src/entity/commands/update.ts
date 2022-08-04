// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import SendCommand from "./cmd";

export default class UpdateCommand extends InstanceCommand {
  constructor() {
    super("UpdateCommand");
  }

  async exec(instance: Instance) {
    // 执行更新预设，预设又功能调度器在启动前设置好
    return await instance.execPreset("update");
  }
}
