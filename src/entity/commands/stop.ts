/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-02 23:46:37
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance/instance";
import InstanceCommand from "./command";
import SendCommand from "./cmd";

export default class StopCommand extends InstanceCommand {
  constructor() {
    super("StopCommand");
  }

  exec(instance: Instance) {
    const stopCommand = instance.config.stopCommand;
    if (instance.status() == Instance.STATUS_STOP || !instance.process || !instance.process.pid) {
      return instance.failure(new Error("实例未处于运行中状态，无法进行停止."));
    }
    instance.status(Instance.STATUS_STOPPING);
    if (stopCommand.toLocaleLowerCase() == "^c") {
      instance.process.kill("SIGINT");
    } else {
      instance.exec(new SendCommand(stopCommand));
    }
    return instance;
  }
}
