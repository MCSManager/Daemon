/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-29 14:36:29
 * @Description:
 * @Projcet: MCSManager Daemon
 */

import Instance from "../instance/instance";
import InstanceCommand from "../commands/command";

export default class MinecraftGetPlayersCommand extends InstanceCommand {
  constructor() {
    super("MinecraftGetPlayersCommand");
  }

  async exec(instance: Instance) {
    console.log("正在执行具体获取Minecraft服务器人数的方法");
    return { player: 10, maxPlayer: 30 };
  }
}
