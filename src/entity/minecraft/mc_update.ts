/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:44
 * @Description:
 * @Projcet: MCSManager Daemon
 */

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
