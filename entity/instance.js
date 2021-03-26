/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例和实例类实现
 */

// const childProcess = require("child_process");
const { EventEmitter } = require("events");
const iconv = require("iconv-lite");
// const { logger } = require("../service/log");
// eslint-disable-next-line no-unused-vars
const { InstanceCommand } = require("./commands/command");
const { KillCommand } = require("./commands/kill");
const { DataStructure } = require("./structure");
// const fs = require("fs-extra");

class InstanceCommandError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class InstanceConfig extends DataStructure {
  constructor(path) {
    super(path);
  }

  parameters(cfg) {
    this.startCommand = cfg.startCommand || "";
    this.stopCommand = cfg.stopCommand || "^C";
    this.cwd = cfg.cwd || ".";
    this.ie = cfg.ie || "GBK";
    this.oe = cfg.oe || "GBK";
    this.save();
  }
}

class Instance extends EventEmitter {
  /**
   * @param {string} startCommand
   */
  constructor(instanceName) {
    super();

    this.STATUS_STOP = Instance.STATUS_STOP;
    this.STATUS_STARTING = Instance.STATUS_STARTING;
    this.STATUS_RUN = Instance.STATUS_RUN;

    //Basic information
    this.processStatus = this.STATUS_STOP;
    this.instanceName = instanceName;

    // Action lock
    this.lock = false;

    // Config init
    this.config = new InstanceConfig(instanceName);
    this.config.load();

    this.process = null;
    this.startCount = 0;
  }

  parameters(cfg) {
    this.config.parameters(cfg);
  }

  setLock(bool) {
    this.lock = bool;
  }

  /**
   * 对本实例执行对应的命令
   * @param {InstanceCommand} command
   * @return {void}
   */
  execCommand(command) {
    if (this.lock) throw new InstanceCommandError("This " + command.info + " operation cannot be completed because the command executes a deadlock.");
    command.exec(this);
  }

  /**
   * 对本实例执行对应的命令 别名
   * @param {InstanceCommand} command
   * @return {void}
   */
  exec(command) {
    this.execCommand(command);
  }

  status() {
    return this.processStatus;
  }

  /**
   * 实例已启动后必须执行的函数
   * @param {NodeJS.Process} process
   */
  started(process) {
    // Process event.
    process.stdout.on("data", (text) => this.emit("data", iconv.decode(text, this.config.ie)));
    process.stderr.on("data", (text) => this.emit("data", iconv.decode(text, this.config.oe)));
    process.on("exit", (code) => this.stoped(code));
    this.process = process;
    this.processStatus = Instance.STATUS_RUN;
    this.emit("open", this);
  }

  /**
   * 实例已关闭后必须执行的函数
   * @param {Number} code
   */
  stoped(code = 0) {
    this.releaseResources();
    this.processStatus = this.STATUS_STOP;
    this.emit("exit", code);
  }

  releaseResources() {
    if (this.process && this.process.stdout && this.process.stderr) {
      // 移除所有动态新增的事件监听者
      for (const eventName of this.process.stdout.eventNames()) this.process.stdout.removeAllListeners(eventName);
      for (const eventName of this.process.stderr.eventNames()) this.process.stderr.removeAllListeners(eventName);
      for (const eventName of this.process.eventNames()) this.process.removeAllListeners(eventName);
      this.process.stdout.destroy();
      this.process.stderr.destroy();
    }
    this.process = null;
  }

  destroy() {
    try {
      this.exec(new KillCommand());
    } finally {
      this.config.del();
    }
  }

}

// 实例类静态变量
Instance.STATUS_STOP = 0;
Instance.STATUS_STARTING = 1;
Instance.STATUS_RUN = 2;

module.exports = {
  Instance
};
