/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import Instance from "../instance/instance";
import InstanceCommand from "../commands/base/command";
import MCServStatus from "../../common/mcping";

export default class MinecraftGetPlayersCommand extends InstanceCommand {
  constructor() {
    super("MinecraftGetPlayersCommand");
  }

  async exec(instance: Instance) {
    // console.log("正在执行具体获取Minecraft服务器人数的方法");
    if (instance.config.pingConfig.ip && instance.config.pingConfig.port) {
      const player = await new MCServStatus(instance.config.pingConfig.port, instance.config.pingConfig.ip).getStatus();
      return player;
    }
    return null;
  }
}
