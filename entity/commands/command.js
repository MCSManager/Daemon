/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 17:43:54
 * @LastEditTime: 2021-03-24 22:16:55
 * @Description: InstanceCommand
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// const { Instance } = require("../../service/instance");

module.exports.InstanceCommand = class {

  /**
   * @param {String} info
   * @return {*}
   */
  constructor(info) {
    this.info = info;
    this.lock = true;
  }

  /**
   * @param {require("../../service/instance").instance} instance
   * @return {*}
   */
  exec(instance) { return instance; }

}
