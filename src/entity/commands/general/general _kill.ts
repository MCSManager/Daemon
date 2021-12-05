/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:52
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";

export default class GeneralKillCommand extends InstanceCommand {
  constructor() {
    super("KillCommand");
  }

  async exec(instance: Instance) {
    if (instance.process) {
      instance.process.kill("SIGKILL");
    }
    instance.setLock(false);
  }
}
