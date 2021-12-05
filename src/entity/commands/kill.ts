/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:46
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";

export default class KillCommand extends InstanceCommand {
  constructor() {
    super("KillCommand");
  }

  async exec(instance: Instance) {

    // 若启用自动重启功能则设置忽略一次
    if (instance.config.eventTask && instance.config.eventTask.autoRestart)
      instance.config.eventTask.ignore = true;

    // 发送终止命令
    return await instance.execPreset("kill");

  }
}
