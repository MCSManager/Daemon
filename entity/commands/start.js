/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-03-26 18:32:12
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Instance } = require("../instance");
const { InstanceCommand } = require("./command");
const { logger } = require("../../service/log");
const childProcess = require("child_process");
// const iconv = require("iconv-lite");

class StartupError extends Error {
  constructor(msg) {
    super(msg);
  }
}

module.exports.StartCommand = class extends InstanceCommand {
  /**
   * @param {String} Source
   * @return {*}
   */
  constructor(Source = "Unknown") {
    super("StartCommand");
    this.Source = Source;
  }

  /**
   * @param {Instance} instance
   * @return {void}
   */
  exec(instance) {
    const instanceStatus = instance.status();
    if (instanceStatus != Instance.STATUS_STOP) {
      throw new StartupError("This instance status is NOT STATUS_STOP.");
    }
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe)
      throw new StartupError("Startup command or working directory cannot be null.");

    instance.setLock(true);

    try {
      // 设置启动状态
      instance.status(Instance.STATUS_STARTING);
      // 启动次数增加
      instance.startCount++;
      // 命令解析
      const commandList = instance.config.startCommand.split(" ");
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);

      logger.info("----------------")
      logger.info(`Object ${this.Source} sends a command to open ${instance.instanceUUID} instance.`);
      logger.info(`Starting instance: [${instance.instanceUUID}]`);
      logger.info(`Command: ${commandExeFile} ${commnadParameters.join(" ")}`);
      logger.info(`Directory: ${instance.config.cwd}`);
      logger.info("----------------")

      // Create process.
      const process = childProcess.spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });
      // Process check.
      if (!process || !process.pid) {
        throw new StartupError(`Failed to create process. Process.pid is ${process.pid}.`);
      }
      // 产生开启事件
      instance.started(process);
      logger.info(`The instance is enabled successfully!`);
    } catch (err) {
      instance.stoped(-2);
      throw new StartupError(`Failed to open instance. Please check your startup parameters: \n ${err}`);
    } finally {
      instance.setLock(false);
    }
  }
};
