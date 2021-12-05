/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:49
 * @Description:
 * @Projcet: MCSManager Daemon
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
      const player = await new MCServStatus(
        instance.config.pingConfig.port,
        instance.config.pingConfig.ip
      ).getStatus();
      return player;
    }
    return null;
  }
}
