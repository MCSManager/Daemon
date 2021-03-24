/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-03-24 22:24:31
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Instance } = require("../../service/instance");
const { InstanceCommand } = require("./command");

module.exports.KillCommand = class extends InstanceCommand {
  /**
   * @param {String} data
   * @return {void}
   */
  constructor() {
    super("KillCommand");
  }

  /**
   * @param {Instance} instance
   * @return {void}
   */
  exec(instance) {
    if (instance.process && instance.process.pid) {
      instance.process.kill("SIGKILL");
      instance.stoped(-3);
      // always unlock
      instance.setLock(false);
    }
    return this;
  }
};
