/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-03-28 10:09:50
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Instance } = require("../instance");
const { InstanceCommand } = require("./command");
const { SendCommand } = require("./cmd");

module.exports.StopCommand = class extends InstanceCommand {
  /**
   * @param {String} data
   * @return {void}
   */
  constructor() {
    super("StopCommand");
  }

  /**
   * @param {Instance} instance
   * @return {void}
   */
  exec(instance) {
    const stopCommand = instance.config.stopCommand;
    if (instance.status() == Instance.STATUS_STOP || !instance.process || !instance.process.pid) {
      throw new Error("The instance is not started and cannot be stopped.");
    }
    instance.status(Instance.STATUS_STOPPING);
    if (stopCommand.toLocaleLowerCase() == "^c") {
      instance.process.kill("SIGINT");
    } else {
      instance.exec(new SendCommand(stopCommand));
    }
    return instance;
  }
};
