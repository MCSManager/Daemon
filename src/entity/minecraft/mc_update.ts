// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "../commands/base/command";

export default class MinecraftUpdateCommand extends InstanceCommand {
  constructor() {
    super("UpdateCommand");
  }

  async exec(instance: Instance) {
    console.log("更新实例.....");
  }
}
