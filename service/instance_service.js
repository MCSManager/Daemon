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
    if (this.instances[instance.instanceName]) {
      throw new Error(`应用实例 ${instance.instanceName} 已经存在.`);
    }
    this.instances[instance.instanceName] = instance;
    // 动态监听新增的实例输出流，传递给自身事件流
    instance.on("data", (...arr) => {
      this.emit("data", instance.instanceName, ...arr);
    });
    instance.on("exit", (...arr) => {
      this.emit("exit", instance.instanceName, ...arr);
    });
    instance.on("open", (...arr) => {
      this.emit("open", instance.instanceName, ...arr);
    });
  }

  /**
   * @param {string} instanceName
   */
  removeInstance(instanceName) {
    const instance = this.getInstance(instanceName);
    if (instance) instance.destroy();
    delete this.instances[instanceName];
    return true;
  }

  /**
   * @param {string} instanceName
   * @return {Instance}
   */
  getInstance(instanceName) {
    return this.instances[instanceName];
  }

  exists(instanceName) {
    return this.instances[instanceName] ? true : false;
  }

  /**
   * @return {{string:Instance}}
   */
  getAllInstance() {
    return this.instances;
  }
}

module.exports.instanceService = new InstanceService();
