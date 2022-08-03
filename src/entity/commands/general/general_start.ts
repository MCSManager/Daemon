// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { $t } from "../../../i18n";
import os from "os";
import Instance from "../../instance/instance";
import logger from "../../../service/log";
import fs from "fs-extra";

import InstanceCommand from "../base/command";
import EventEmitter from "events";
import { IInstanceProcess } from "../../instance/interface";
import { ChildProcess, exec, spawn } from "child_process";
import { commandStringToArray } from "../base/command_parser";
import { killProcess } from "../../../common/process_tools";

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
    return killProcess(this.pid, this.process, s);
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
    } catch (error) {}
  }
}

export default class GeneralStartCommand extends InstanceCommand {
  constructor() {
    super("StartCommand");
  }

  async exec(instance: Instance, source = "Unknown") {
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe)
      return instance.failure(new StartupError($t("general_start.instanceConfigErr")));
    if (!fs.existsSync(instance.absoluteCwdPath())) return instance.failure(new StartupError($t("general_start.cwdPathNotExist")));

    try {
      instance.setLock(true);
      // 设置启动状态
      instance.status(Instance.STATUS_STARTING);
      // 启动次数增加
      instance.startCount++;

      // 命令解析
      const commandList = commandStringToArray(instance.config.startCommand);
      const commandExeFile = commandList[0];
      const commandParameters = commandList.slice(1);
      if (commandList.length === 0) {
        return instance.failure(new StartupError($t("general_start.cmdEmpty")));
      }

      logger.info("----------------");
      logger.info($t("general_start.startInstance", { source: source }));
      logger.info($t("general_start.instanceUuid", { uuid: instance.instanceUuid }));
      logger.info($t("general_start.startCmd", { cmdList: JSON.stringify(commandList) }));
      logger.info($t("general_start.cwd", { cwd: instance.config.cwd }));
      logger.info("----------------");

      // 创建子进程
      // 参数1直接传进程名或路径（含空格），无需双引号
      const process = spawn(commandExeFile, commandParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });

      // 子进程创建结果检查
      if (!process || !process.pid) {
        instance.println(
          "ERROR",
          $t("general_start.pidErr", {
            startCommand: instance.config.startCommand,
            commandExeFile: commandExeFile,
            commandParameters: JSON.stringify(commandParameters)
          })
        );
        throw new StartupError($t("general_start.startErr"));
      }

      // 创建进程适配器
      const processAdapter = new ProcessAdapter(process);

      // 产生开启事件
      instance.started(processAdapter);
      logger.info($t("general_start.startSuccess", { instanceUuid: instance.instanceUuid, pid: process.pid }));
      instance.println("INFO", $t("general_start.startOrdinaryTerminal"));
    } catch (err) {
      instance.instanceStatus = Instance.STATUS_STOP;
      instance.releaseResources();
      return instance.failure(err);
    } finally {
      instance.setLock(false);
    }
  }
}
