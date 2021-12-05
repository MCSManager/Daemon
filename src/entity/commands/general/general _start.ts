import os from 'os';
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-29 16:53:17
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../../instance/instance";
import logger from "../../../service/log";
import fs from "fs-extra";

import InstanceCommand from "../base/command";
import EventEmitter from "events";
import { IInstanceProcess } from "../../../entity/instance/interface";
import { ChildProcess, exec, spawn } from "child_process";
import { commandStringToArray } from "../base/command_parser";

// 启动时错误异常
class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

// Docker 进程适配器
class ProcessAdapter extends EventEmitter implements IInstanceProcess {
  pid?: number | string;

  constructor(private process: ChildProcess) {
    super();
    this.pid = this.process.pid;
    process.stdout.on("data", (text) => this.emit("data", text));
    process.stderr.on("data", (text) => this.emit("data", text));
    process.on("exit", (code) => this.emit("exit", code));
  }

  public write(data?: string) {
    return this.process.stdin.write(data);
  }

  public kill(s?: any) {
    if (os.platform() === "win32") {
      return exec(`taskkill /PID ${this.pid} /T /F`, (err, stdout, stderr) => {
        logger.info(`实例进程 ${this.pid} 正在使用指令强制结束.`);
        logger.info(`实例进程 ${this.pid} 强制结束结果:\n Error: ${err}\n Stdout: ${stdout}`);
      });
    }
    if (os.platform() === "linux") {
      return exec(`kill -s 9 ${this.pid}`, (err, stdout, stderr) => {
        logger.info(`实例进程 ${this.pid} 正在使用指令强制结束.`);
        logger.info(`实例进程 ${this.pid} 强制结束结果:\n Error: ${err}\n Stdout: ${stdout}`);
      });
    }
    if (s)
      this.process.kill(s);
    else
      this.process.kill("SIGKILL");
  }

  public async destroy() {
    try {
      if (this.process && this.process.stdout && this.process.stderr) {
        // 移除所有动态新增的事件监听者
        for (const eventName of this.process.stdout.eventNames()) this.process.stdout.removeAllListeners(eventName);
        for (const eventName of this.process.stderr.eventNames()) this.process.stderr.removeAllListeners(eventName);
        for (const eventName of this.process.eventNames()) this.process.removeAllListeners(eventName);
        this.process.stdout.destroy();
        this.process.stderr.destroy();
      }
    } catch (error) { }
  }
}

export default class GeneralStartCommand extends InstanceCommand {
  constructor() {
    super("StartCommand");
  }

  async exec(instance: Instance, source = "Unknown") {
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

      // 命令解析
      const commandList = commandStringToArray(instance.config.startCommand);
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);

      logger.info("----------------");
      logger.info(`会话 ${source}: 请求开启实例.`);
      logger.info(`实例标识符: [${instance.instanceUuid}]`);
      logger.info(`启动命令: ${JSON.stringify(commandList)}`);
      logger.info(`工作目录: ${instance.config.cwd}`);
      logger.info("----------------");

      // 创建子进程
      // 参数1直接传进程名或路径（含空格），无需双引号
      const process = spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });

      // 子进程创建结果检查
      if (!process || !process.pid) {
        throw new StartupError(`进程启动失败，进程PID为空，请检查启动命令和相关参数.`);
      }

      // 创建进程适配器
      const processAdapter = new ProcessAdapter(process);

      // 产生开启事件
      instance.started(processAdapter);
      logger.info(`实例 ${instance.instanceUuid} 成功启动 PID: ${process.pid}.`);
    } catch (err) {
      instance.instanceStatus = Instance.STATUS_STOP;
      instance.releaseResources();
      return instance.failure(err);
    } finally {
      instance.setLock(false);
    }
  }
}
