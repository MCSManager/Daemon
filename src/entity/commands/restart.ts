/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 17:14:20
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";

export default class RestartCommand extends InstanceCommand {
  constructor() {
    super("RestartCommand");
  }

  async exec(instance: Instance) {
    // 若启用自动重启功能则设置忽略一次
    if (instance.config.eventTask && instance.config.eventTask.autoRestart)
      instance.config.eventTask.ignore = true;

    return await instance.execPreset("restart");
  }
}
