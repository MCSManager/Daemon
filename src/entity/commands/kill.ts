/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-02 22:58:49
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

  exec(instance: Instance) {
    if (instance.process && instance.process.pid) {
      instance.process.kill("SIGKILL");
    }
    // instance.stoped(-1);
    instance.setLock(false);
  }
}
