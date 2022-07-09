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

import { EventEmitter } from "events";
import iconv from "iconv-lite";
import path from "path";
import { IExecutable } from "./preset";
import InstanceCommand from "../commands/base/command";
import InstanceConfig from "./Instance_config";
import StorageSubsystem from "../../common/system_storage";
import { LifeCycleTaskManager } from "./life_cycle";
import { PresetCommandManager } from "./preset";
import FunctionDispatcher from "../commands/dispatcher";
import { IInstanceProcess } from "./interface";
import StartCommand from "../commands/start";
import { configureEntityParams } from "../../common/typecheck";

// 实例无需持久化储存的额外信息
interface IInstanceInfo {
  currentPlayers: number;
  maxPlayers: number;
  version: string;
  fileLock: number;
  playersChart: Array<{ value: string }>;
}

// 实例类
export default class Instance extends EventEmitter {
  // 实例类状态常量
  public static readonly STATUS_BUSY = -1;
  public static readonly STATUS_STOP = 0;
  public static readonly STATUS_STOPPING = 1;
  public static readonly STATUS_STARTING = 2;
  public static readonly STATUS_RUNNING = 3;

  // 实例类型常量
  public static readonly TYPE_UNIVERSAL = "universal"; // 通用输入输出程序

  // Minecraft 服务端类型
  public static readonly TYPE_MINECRAFT_JAVA = "minecraft/java"; // Minecraft PC 版通用服务端
  public static readonly TYPE_MINECRAFT_BEDROCK = "minecraft/bedrock"; // Minecraft 基岩版

  // 实例基本属性，无需持久化
  public instanceStatus: number;
  public instanceUuid: string;
  public lock: boolean;
  public startCount: number;
  public startTimestamp: number = 0;
  // 正在进行的异步任务
  public asynchronousTask: IExecutable = null;

  // 生命周期任务，定时任务管理器
  public readonly lifeCycleTaskManager = new LifeCycleTaskManager(this);
  // 预设命令管理器
  public readonly presetCommandManager = new PresetCommandManager(this);

  // 实例需要持久化保存并且作为配置的实体类
  public config: InstanceConfig;

  // 实例无需持久化保存的具体信息
  public info: IInstanceInfo = {
    currentPlayers: -1,
    maxPlayers: -1,
    version: "",
    fileLock: 0,
    playersChart: []
  };

  // 实例的真实进程
  public process: IInstanceProcess;

  // 初始化实例时必须通过uuid与配置类进行初始化实例，否则实例将处于不可用
  constructor(instanceUuid: string, config: InstanceConfig) {
    super();

    if (!instanceUuid || !config) throw new Error("初始化实例失败，唯一标识符或配置参数为空");

    // Basic information
    this.instanceStatus = Instance.STATUS_STOP;
    this.instanceUuid = instanceUuid;

    // Action lock
    this.lock = false;

    this.config = config;

    this.process = null;
    this.startCount = 0;
  }

  // 传入实例配置，松散型动态的给实例参数设置配置项
  parameters(cfg: any) {
    // 若实例类型改变，则必须重置预设命令与生命周期事件
    if (cfg.type && cfg.type != this.config.type) {
      if (this.status() != Instance.STATUS_STOP) throw new Error("正在运行时无法修改此实例类型");
      configureEntityParams(this.config, cfg, "type", String);
      this.forceExec(new FunctionDispatcher());
    }
    // 若进程类型改变，则必须重置预设命令与生命周期事件
    if (cfg.processType && cfg.processType !== this.config.processType) {
      if (this.status() != Instance.STATUS_STOP) throw new Error("正在运行时无法修改此实例进程类型");
      configureEntityParams(this.config, cfg, "processType", String);
      this.forceExec(new FunctionDispatcher());
    }
    configureEntityParams(this.config, cfg, "nickname", String);
    configureEntityParams(this.config, cfg, "startCommand", String);
    configureEntityParams(this.config, cfg, "stopCommand", String);
    configureEntityParams(this.config, cfg, "cwd", String);
    configureEntityParams(this.config, cfg, "ie", String);
    configureEntityParams(this.config, cfg, "oe", String);
    configureEntityParams(this.config, cfg, "endTime", String);
    configureEntityParams(this.config, cfg, "fileCode", String);
    configureEntityParams(this.config, cfg, "updateCommand", String);
    configureEntityParams(this.config, cfg, "pty", Boolean);
    configureEntityParams(this.config, cfg, "ptyWindowCol", Number);
    configureEntityParams(this.config, cfg, "ptyWindowRow", Number);
    if (cfg.docker) {
      configureEntityParams(this.config.docker, cfg.docker, "containerName", String);
      configureEntityParams(this.config.docker, cfg.docker, "image", String);
      configureEntityParams(this.config.docker, cfg.docker, "memory", Number);
      configureEntityParams(this.config.docker, cfg.docker, "ports");
      configureEntityParams(this.config.docker, cfg.docker, "extraVolumes");
      configureEntityParams(this.config.docker, cfg.docker, "maxSpace", Number);
      configureEntityParams(this.config.docker, cfg.docker, "io", Number);
      configureEntityParams(this.config.docker, cfg.docker, "network", Number);
      configureEntityParams(this.config.docker, cfg.docker, "networkMode", String);
      configureEntityParams(this.config.docker, cfg.docker, "networkAliases");
      configureEntityParams(this.config.docker, cfg.docker, "cpusetCpus", String);
      configureEntityParams(this.config.docker, cfg.docker, "cpuUsage", Number);
    }
    if (cfg.pingConfig) {
      configureEntityParams(this.config.pingConfig, cfg.pingConfig, "ip", String);
      configureEntityParams(this.config.pingConfig, cfg.pingConfig, "port", Number);
      configureEntityParams(this.config.pingConfig, cfg.pingConfig, "type", Number);
    }
    if (cfg.eventTask) {
      configureEntityParams(this.config.eventTask, cfg.eventTask, "autoStart", Boolean);
      configureEntityParams(this.config.eventTask, cfg.eventTask, "autoRestart", Boolean);
      configureEntityParams(this.config.eventTask, cfg.eventTask, "ignore", Boolean);
    }
    if (cfg.terminalOption) {
      configureEntityParams(this.config.terminalOption, cfg.terminalOption, "haveColor", Boolean);
    }
    StorageSubsystem.store("InstanceConfig", this.instanceUuid, this.config);
  }

  setLock(bool: boolean) {
    this.lock = bool;
  }

  // 对本实例执行对应的命令
  async execCommand(command: InstanceCommand) {
    if (this.lock) throw new Error(`此 ${command.info} 操作无法执行，因为实例处于锁定状态，请稍后再试.`);
    if (this.status() == Instance.STATUS_BUSY) throw new Error(`当前实例正处于忙碌状态，无法执行任何操作.`);
    return await command.exec(this);
  }

  // 对本实例执行对应的命令 别名
  async exec(command: InstanceCommand) {
    return await this.execCommand(command);
  }

  // 强制执行命令
  async forceExec(command: InstanceCommand) {
    return await command.exec(this);
  }

  // 设置实例状态或获取状态
  status(v?: number) {
    if (v != null) this.instanceStatus = v;
    return this.instanceStatus;
  }

  // 实例启动后必须执行的函数
  // 触发 open 事件和绑定 data 与 exit 事件等
  started(process: IInstanceProcess) {
    this.config.lastDatetime = this.fullTime();
    process.on("data", (text) => this.emit("data", iconv.decode(text, this.config.oe)));
    process.on("exit", (code) => this.stoped(code));
    this.process = process;
    this.instanceStatus = Instance.STATUS_RUNNING;
    this.emit("open", this);
    // 启动所有生命周期任务
    this.lifeCycleTaskManager.execLifeCycleTask(1);
  }

  // 实例进行任何操作异常则必须通过此函数抛出异常
  // 触发 failure 事件
  failure(error: Error) {
    this.emit("failure", error);
    this.println("错误", error.message);
    throw error;
  }

  // 实例已关闭后必须执行的函数
  // 触发 exit 事件
  stoped(code = 0) {
    this.releaseResources();
    if (this.instanceStatus != Instance.STATUS_STOP) {
      this.instanceStatus = Instance.STATUS_STOP;
      this.emit("exit", code);
      StorageSubsystem.store("InstanceConfig", this.instanceUuid, this.config);
    }
    // 关闭所有生命周期任务
    this.lifeCycleTaskManager.execLifeCycleTask(0);

    // 若启用自动重启则立刻执行启动操作
    if (this.config.eventTask.autoRestart) {
      if (!this.config.eventTask.ignore) {
        this.forceExec(new StartCommand("Event Task: Auto Restart"))
          .then(() => {
            this.println("信息", "检测到实例关闭，根据主动事件机制，自动重启指令已发出...");
          })
          .catch((err) => {
            this.println("错误", `自动重启错误: ${err}`);
          });
      }
      this.config.eventTask.ignore = false;
    }

    // 启动后瞬间关闭警告，一般是启动命令编写错误
    const currentTimestamp = new Date().getTime();
    const startThreshold = 3 * 1000;
    if (currentTimestamp - this.startTimestamp < startThreshold) {
      this.println("ERROR", `检测到实例启动后在极短的时间内退出，原因可能是您的启动命令错误或配置文件错误。`);
    }
  }

  // 自定义输出方法，格式化
  println(level: string, text: string) {
    const str = `\n[MCSMANAGER] [${level}] ${text}\n`;
    this.emit("data", str);
  }

  // 自定义输出方法
  print(data: any) {
    this.emit("data", data);
  }

  // 释放资源（主要释放进程相关的资源）
  releaseResources() {
    this.process = null;
  }

  // 销毁本实例
  destroy() {
    if (this.process && this.process.pid) {
      this.process.kill("SIGKILL");
    }
    this.process = null;
  }

  fullTime() {
    const date = new Date();
    return date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes();
  }

  absoluteCwdPath() {
    if (!this.config || !this.config.cwd) return null;
    if (path.isAbsolute(this.config.cwd)) return path.normalize(this.config.cwd);
    return path.normalize(path.join(process.cwd(), this.config.cwd));
  }

  async usedSpace(tmp?: string, maxDeep = 4, deep = 0) {
    // if (deep >= maxDeep) return 0;
    // let size = 0;
    // const topPath = tmp ? tmp : this.absoluteCwdPath();
    // const files = await fs.readdir(topPath);
    // for (const fileName of files) {
    //   const absPath = path.join(topPath, fileName);
    //   const info = await fs.stat(absPath);
    //   if (info.isDirectory()) {
    //     size += await this.usedSpace(absPath, maxDeep, deep + 1);
    //   } else {
    //     size += info.size;
    //   }
    // }
    return 0;
  }

  // 执行预设命令动作
  async execPreset(action: string, p?: any) {
    if (this.presetCommandManager) {
      return await this.presetCommandManager.execPreset(action, p);
    }
    throw new Error(`Preset Manager does not exist`);
  }

  setPreset(action: string, cmd: InstanceCommand) {
    this.presetCommandManager.setPreset(action, cmd);
  }

  getPreset(action: string) {
    return this.presetCommandManager.getPreset(action);
  }

  clearPreset() {
    this.presetCommandManager.clearPreset();
  }
}
