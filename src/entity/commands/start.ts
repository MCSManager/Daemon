/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-29 16:01:02
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance/instance";
import logger from "../../service/log";
import fs from "fs-extra";

import InstanceCommand from "./command";
import * as childProcess from "child_process";
import FuntionDispatcher from "./dispatcher";

class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default class StartCommand extends InstanceCommand {
  public source: string;

  constructor(source = "Unknown") {
    super("StartCommand");
    this.source = source;
  }

  async exec(instance: Instance) {
    const instanceStatus = instance.status();
    if (instanceStatus != Instance.STATUS_STOP) return instance.failure(new StartupError("实例未处于关闭状态，无法再进行启动"));
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe) return instance.failure(new StartupError("启动命令，输入输出编码或工作目录为空值"));
    if (!fs.existsSync(instance.absoluteCwdPath())) return instance.failure(new StartupError("工作目录并不存在"));

    try {
      instance.setLock(true);
      // 设置启动状态
      instance.status(Instance.STATUS_STARTING);
      // 启动次数增加
      instance.startCount++;
      // 强制执行实例进程配置文件调度器
      // await instance.forceExec(new FuntionDispatcher());

      // 命令解析
      const commandList = instance.config.startCommand.replace(/  /gim, " ").split(" ");
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);

      logger.info("----------------");
      logger.info(`会话 ${this.source}: 请求开启实例.`);
      logger.info(`实例标识符: [${instance.instanceUuid}]`);
      logger.info(`启动命令: ${commandExeFile} ${commnadParameters.join(" ")}`);
      logger.info(`工作目录: ${instance.config.cwd}`);
      logger.info("----------------");

      // 创建子进程
      const process = childProcess.spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });

      // 子进程创建结果检查
      if (!process || !process.pid) {
        throw new StartupError(`进程启动失败，进程PID为空，请检查启动命令和相关参数.`);
      }
      // 产生开启事件
      instance.started(process);
      logger.info(`实例 ${instance.instanceUuid} 成功启动.`);
    } catch (err) {
      instance.instanceStatus = Instance.STATUS_STOP;
      instance.releaseResources();
      return instance.failure(err);
    } finally {
      instance.setLock(false);
    }
  }
}
