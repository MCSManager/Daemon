/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-29 11:28:12
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance/instance";
import InstanceCommand from "./command";

export default class KillCommand extends InstanceCommand {
  constructor() {
    super("KillCommand");
  }

  async exec(instance: Instance) {
    if (instance.process && instance.process.pid) {
      instance.process.kill("SIGKILL");
    }
    instance.setLock(false);
  }
}
