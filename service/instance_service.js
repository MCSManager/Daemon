/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 15:29:45
 * @Description: 
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */
// eslint-disable-next-line no-unused-vars
const { Instance } = require("../entity/instance");
const { EventEmitter } = require("events");


class InstanceService extends EventEmitter {
  constructor() {
    super();
    this.instances = {};
  }

  /**
   * @param {Instance} instance
   * @return {*}
   */
  createInstance(instance) {
    this.addInstance(instance);
    return instance;
  }

  /**
   * @param {Instance} instance
   */
  addInstance(instance) {
    if (this.instances[instance.instanceUUID]) {
      throw new Error(`应用实例 ${instance.instanceUUID} 已经存在.`);
    }
    this.instances[instance.instanceUUID] = instance;
    // 动态监听新增的实例输出流，传递给自身事件流
    instance.on("data", (...arr) => {
      this.emit("data", instance.instanceUUID, ...arr);
    });
    instance.on("exit", (...arr) => {
      this.emit("exit", instance.instanceUUID, ...arr);
    });
    instance.on("open", (...arr) => {
      this.emit("open", instance.instanceUUID, ...arr);
    });
  }

  /**
   * @param {string} instanceUUID
   */
  removeInstance(instanceUUID) {
    const instance = this.getInstance(instanceUUID);
    if (instance) instance.destroy();
    delete this.instances[instanceUUID];
    return true;
  }

  /**
   * @param {string} instanceUUID
   * @return {Instance}
   */
  getInstance(instanceUUID) {
    return this.instances[instanceUUID];
  }

  exists(instanceUUID) {
    return this.instances[instanceUUID] ? true : false;
  }

  /**
   * @return {{string:Instance}}
   */
  getAllInstance() {
    return this.instances;
  }
}

module.exports.instanceService = new InstanceService();
