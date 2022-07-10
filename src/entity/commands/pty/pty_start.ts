/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
*/

import os from "os";
import Instance from "../../instance/instance";
import logger from "../../../service/log";
import fs from "fs-extra";
import path from "path";

import InstanceCommand from "../base/command";
import EventEmitter from "events";
import { IInstanceProcess } from "../../instance/interface";
import { ChildProcess, exec, spawn } from "child_process";
import { commandStringToArray } from "../base/command_parser";
import { killProcess } from "../../../common/process_tools";
import GeneralStartCommand from "../general/general_start";
import FunctionDispatcher from "../dispatcher";
import StartCommand from "../start";

// 启动时错误异常
class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

// 进程适配器
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

export default class PtyStartCommand extends InstanceCommand {
  constructor() {
    super("PtyStartCommand");
  }

  async exec(instance: Instance, source = "Unknown") {
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe) return instance.failure(new StartupError("启动命令，输入输出编码或工作目录为空值"));
    if (!fs.existsSync(instance.absoluteCwdPath())) return instance.failure(new StartupError("工作目录并不存在"));

    try {
      // PTY 模式正确性检查
      let ptyAppName = "pty.exe";
      if (os.platform() !== "win32") ptyAppName = "pty";
      const ptyAppPath = path.normalize(path.join(process.cwd(), "lib", ptyAppName));
      if (!fs.existsSync(ptyAppPath)) {
        logger.info(`会话 ${source}: 请求开启实例，模式为 PTY 终端`);
        logger.warn("PTY 终端转发程序不存在，自动降级到普通启动模式");
        instance.println("ERROR", "面板 PTY 终端依赖程序不存在，已自动降级到普通启动模式，您将无法使用 Ctrl，Tab 等快捷功能键。");
        // 关闭 PTY 类型，重新配置实例功能组，重新启动实例
        instance.config.terminalOption.pty = false;
        await instance.forceExec(new FunctionDispatcher());
        await instance.execPreset("start", source); // 直接执行预设命令
        return;
      }

      // 设置启动状态 & 启动次数增加
      instance.setLock(true);
      instance.status(Instance.STATUS_STARTING);
      instance.startCount++;

      // 命令解析
      const commandList = commandStringToArray(instance.config.startCommand);
      if (commandList.length === 0) return instance.failure(new StartupError("无法启动实例，启动命令为空"));
      const ptyParameter = ["-dir", instance.config.cwd, "-cmd", commandList.join(" "), "-size", `${instance.config.terminalOption.ptyWindowCol},${instance.config.terminalOption.ptyWindowRow}`];

      logger.info("----------------");
      logger.info(`会话 ${source}: 请求开启实例.`);
      logger.info(`实例标识符: [${instance.instanceUuid}]`);
      logger.info(`启动命令: ${commandList.join(" ")}`);
      logger.info(`PTY 路径: ${[ptyAppPath]}`);
      logger.info(`PTY 参数: ${ptyParameter.join(" ")}`);
      logger.info(`工作目录: ${instance.config.cwd}`);
      logger.info("----------------");

      // 创建子进程
      // 参数1直接传进程名或路径（含空格），无需双引号
      // console.log(path.dirname(ptyAppPath));
      const subProcess = spawn(ptyAppPath, ptyParameter, {
        cwd: path.dirname(ptyAppPath),
        stdio: "pipe",
        windowsHide: true
      });

      // 子进程创建结果检查
      if (!subProcess || !subProcess.pid) {
        instance.println(
          "ERROR",
          `检测到实例进程/容器启动失败（PID 为空），其可能的原因是：
1. 实例启动命令编写错误，请前往实例设置界面检查启动命令与参数。
2. 系统主机环境不正确或缺少环境，如 Java 环境等。

原生启动命令：
${instance.config.startCommand}

启动命令解析体:
程序：${ptyAppName}
参数：${JSON.stringify(ptyParameter)}

请将此信息报告给管理员，技术人员或自行排查故障。
如果您认为是面板伪终端导致的问题，请在左侧终端设置中关闭“伪终端”选项，我们将会采用原始输入输出流的方式监听程序。
`
        );
        throw new StartupError("实例启动失败，请检查启动命令，主机环境和配置文件等");
      }

      // 创建进程适配器
      const processAdapter = new ProcessAdapter(subProcess);

      // 产生开启事件
      instance.started(processAdapter);
      logger.info(`实例 ${instance.instanceUuid} 成功启动 PID: ${process.pid}.`);
      instance.println("INFO", "面板终端 PTY 模式已生效，您可以直接在终端内输入文字并使用 Ctrl，Tab 等功能键。");
    } catch (err) {
      instance.instanceStatus = Instance.STATUS_STOP;
      instance.releaseResources();
      return instance.failure(err);
    } finally {
      instance.setLock(false);
    }
  }
}
