/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例和实例类实现
 */

import { EventEmitter } from "events";
import * as iconv from "iconv-lite";
import { ChildProcess } from "child_process";
import * as path from "path";

import InstanceCommand from "../commands/command";
import InstanceConfig from "./Instance_config";
import StorageSubsystem from "../../common/system_storage";

// 实例无需持久化储存的额外信息
interface IInstanceInfo {
  player: number;
  maxPlayer: number;
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
  public static readonly TYPE_UNIVERSAL = "TYPE_UNIVERSAL"; // 通用
  public static readonly TYPE_MINECRAFT = "TYPE_MINECRAFT"; // Minecraft 游戏服务端
  public static readonly TYPE_WEB_SHELL = "TYPE_WEB_SHELL"; // WebShell 程序
  public static readonly TYPE_LOW_PERMISSION = "TYPE_LOW_PERMISSION"; // 低权限程序

  // 实例基本属性，无需持久化
  public instanceStatus: number;
  public instanceUuid: string;
  public lock: boolean;
  public startCount: number;

  // 实例需要持久化保存并且作为配置的实体类
  public config: InstanceConfig;

  // 实例无需持久化保存的具体信息
  public info: IInstanceInfo = { player: -1, maxPlayer: -1 };

  // 实例的真实进程
  public process: ChildProcess;

  // 初始化实例时必须通过uuid与配置类进行初始化实例，否则实例将处于不可用
  constructor(instanceUuid: string, config: InstanceConfig) {
    super();

    if (!instanceUuid || !config) throw new Error("初始化实例失败，唯一标识符或配置参数为空");

    //Basic information
    this.instanceStatus = Instance.STATUS_STOP;
    this.instanceUuid = instanceUuid;

    // Action lock
    this.lock = false;

    this.config = config;

    this.process = null;
    this.startCount = 0;
  }

  parameters(cfg: any) {
    if (cfg.nickname) this.config.nickname = cfg.nickname;
    if (cfg.startCommand) this.config.startCommand = cfg.startCommand;
    if (cfg.stopCommand) this.config.stopCommand = cfg.stopCommand;
    if (cfg.cwd) this.config.cwd = cfg.cwd;
    if (cfg.ie) this.config.ie = cfg.ie;
    if (cfg.oe) this.config.oe = cfg.oe;
    if (cfg.type) this.config.type = cfg.type;
    if (cfg.maxSpace) this.config.maxSpace = cfg.maxSpace;
    if (cfg.endTime) this.config.endTime = cfg.endTime;

    if (cfg.docker) {
      this.config.docker.image = cfg.docker.image || "";
      this.config.docker.xmx = cfg.docker.xmx || "";
      this.config.docker.cpu = cfg.docker.cpu || "";
      this.config.docker.ports = cfg.docker.ports || [];
    }

    StorageSubsystem.store(InstanceConfig, this.instanceUuid, this.config);
  }

  setLock(bool: boolean) {
    this.lock = bool;
  }

  // 对本实例执行对应的命令
  execCommand(command: InstanceCommand) {
    if (this.lock) throw new Error(`此 ${command.info} 操作无法执行，因为实例处于锁定状态，请稍后再试.`);
    if (this.status() == Instance.STATUS_BUSY) throw new Error(`当前实例正处于忙碌状态，无法执行任何操作.`);
    command.exec(this);
  }

  // 对本实例执行对应的命令 别名
  exec(command: InstanceCommand) {
    this.execCommand(command);
  }

  // 设置实例状态或获取状态
  status(v?: number) {
    if (v) this.instanceStatus = v;
    return this.instanceStatus;
  }

  // 实例启动后必须执行的函数
  // 触发 open 事件和绑定 data 与 exit 事件等
  started(process: ChildProcess) {
    this.config.lastDatetime = this.fullTime();
    process.stdout.on("data", (text) => this.emit("data", iconv.decode(text, this.config.ie)));
    process.stderr.on("data", (text) => this.emit("data", iconv.decode(text, this.config.oe)));
    process.on("exit", (code) => this.stoped(code));
    this.process = process;
    this.instanceStatus = Instance.STATUS_RUNNING;
    this.emit("open", this);
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
      StorageSubsystem.store(InstanceConfig, this.instanceUuid, this.config);
    }
  }

  println(level: string, text: string) {
    const str = `\n[MCSMANAGER] [${level}] ${text}\n`;
    this.emit("data", str);
  }

  // 释放资源（主要释放进程相关的资源）
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
}
