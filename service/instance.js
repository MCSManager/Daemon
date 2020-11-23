/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例和实例类实现
 */

const childProcess = require("child_process");
const { EventEmitter } = require("events");
const iconv = require("iconv-lite");
const { logger } = require("../service/log");

// 启动时异常类
class StartupError extends Error {
  constructor(msg) {
    super(msg);
  }
}

// 应用实例进程类
class InstanceApp extends EventEmitter {
  /**
   * @param {string} startCommand
   */
  constructor() {
    super();
    this.STATUS_STOP = InstanceApp.STATUS_STOP;
    this.STATUS_STARTING = InstanceApp.STATUS_STARTING;
    this.STATUS_RUN = InstanceApp.STATUS_RUN;
    this.processStatus = this.STATUS_STOP;

    this.startCommand = "";
    this.stopCommand = "^C";
    this.cwd = ".";
    this.ie = "GBK";
    this.oe = "GBK";

    this.process = null;
    this.startCount = 0;
  }

  setStartCommand(command) {
    this.startCommand = command;
    return this;
  }

  setCwd(cwd) {
    this.cwd = cwd;
    return this;
  }

  setStopCommand(cmd) {
    this.stopCommand = cmd;
  }

  // 通过命令执行程序
  start() {
    if (!this.startCommand || !this.cwd || !this.ie || !this.oe) throw new StartupError("启动时错误: 启动命令或工作目录设置不可为空.");

    if (this.processStatus == this.STATUS_STARTING) throw new StartupError("启动时错误: 应用实例进程正在启动中");

    if (this.processStatus != this.STATUS_STOP) throw new StartupError("启动时错误: 应用实例进程已经正在运行");

    this.processStatus = this.STATUS_STARTING;
    this.startCount++;
    // 命令解析
    const commandList = this.startCommand.split(" ");
    const commandExeFile = commandList[0];
    const commnadParameters = commandList.slice(1);

    logger.info(`启动命令: ${commandExeFile} ${commnadParameters.join(" ")}`);
    logger.info(`工作目录: ${this.cwd}`);

    try {
      // 启动进程
      this.process = childProcess.spawn(commandExeFile, commnadParameters, {
        cwd: this.cwd,
        stdio: "pipe",
        windowsHide: true
      });
      // 输出流
      this.process.stdout.on("data", (text) => {
        this.emit("data", iconv.decode(text, this.ie));
      });
      this.process.stderr.on("data", (text) => {
        this.emit("data", iconv.decode(text, this.ie));
      });
    } catch (err) {
      this.stoped(-2);
      throw new StartupError(`创建进程错误: ${err.message}`);
    }

    // 验证是否启动成功
    if (!this.process || !this.process.pid) {
      this.stoped(-2);
      throw new StartupError("启动错误: 使用命令未能成功启动进程，建议检查启动命令.");
    }

    // 设置启动状态
    this.processStatus = this.STATUS_RUN;

    // 设置退出事件传递与监听
    this.process.on("exit", (code) => {
      this.stoped(code);
    });

    // 产生开启事件
    this.emit("open", this);
  }

  // 使用自定义命令来进行关闭操作
  stop() {
    const stopCommand = this.stopCommand;
    if (stopCommand.toLocaleLowerCase() == "^c") {
      this.process.kill("SIGINT");
    } else {
      this.sendCommand(stopCommand);
    }
  }

  // 杀死进程
  kill() {
    if (this.process && this.process.pid) {
      const killcommand = ("/f /pid " + this.process.pid + " /T").split(" ");
      const exe = childProcess.spawn("taskkill", killcommand, {});
      exe.stdout.on("data", () => {});
      exe.stderr.on("data", () => {});
      this.stoped(-3);
    }
  }

  /**
   * 向实例进程发送命令
   * @param {string} command
   */
  sendCommand(command) {
    if (!this.process && this.status() != this.STATUS_RUN) {
      throw new Error("命令执行错误，实例并未运行或未实例化");
    }
    this.process.stdin.write(iconv.encode(command, this.oe));
    this.process.stdin.write("\n");
    return this;
  }

  status() {
    return this.processStatus;
  }

  /**
   * 应用实例退出时触发的函数，此函数建议仅限内部调用
   * @param {number} code
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
}

// 实例类静态变量
InstanceApp.STATUS_STOP = 0;
InstanceApp.STATUS_STARTING = 1;
InstanceApp.STATUS_RUN = 2;

// 应用实例类
class Instance extends InstanceApp {
  /**
   * @param {string} instanceName
   * @param {InstanceProcess} instanceProcess
   */
  constructor(instanceName) {
    super();
    this.instanceName = instanceName;
    this.on("exit", () => {
      logger.info(`应用实例 ${this.instanceName} 已关闭`);
    });
  }

  destroy() {
    if (super.status() != super.STATUS_STOP) super.kill();
    this.releaseResources();
    for (const eventName of this.eventNames()) this.removeAllListeners(eventName);
  }

  start() {
    logger.info(`应用实例 ${this.instanceName} 正在启动...`);
    super.start();
  }
}

module.exports = {
  Instance
};
