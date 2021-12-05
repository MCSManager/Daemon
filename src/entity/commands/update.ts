/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 14:38:29
 * @LastEditTime: 2021-08-14 16:52:51
 * @Description:
 * @Projcet: MCSManager Daemon
 */
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
