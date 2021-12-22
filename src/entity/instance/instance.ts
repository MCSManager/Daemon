import { EventEmitter } from "events";
import iconv from "iconv-lite";
import path from "path";

import InstanceCommand from "../commands/base/command";
import InstanceConfig from "./Instance_config";
import StorageSubsystem from "../../common/system_storage";
import { LifeCycleTaskManager } from "./life_cycle";
import { PresetCommandManager } from "./preset";
import FuntionDispatcher from "../commands/dispatcher";
import { IInstanceProcess } from "./interface";
import StartCommand from "../commands/start";

// 实例无需持久化储存的额外信息
interface IInstanceInfo {
  currentPlayers: number;
  maxPlayers: number;
  version: string;
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
    version: ""
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
    if (cfg.type != null && cfg.type != this.config.type) {
      if (this.status() != Instance.STATUS_STOP) throw new Error("正在运行时无法修改此实例类型");
      this.configureParams(this.config, cfg, "type", String, "");
      this.forceExec(new FuntionDispatcher());
    }
    this.configureParams(this.config, cfg, "nickname", String, "");
    this.configureParams(this.config, cfg, "startCommand", String, "");
    this.configureParams(this.config, cfg, "stopCommand", String, "");
    this.configureParams(this.config, cfg, "cwd", String, "");
    this.configureParams(this.config, cfg, "ie", String, "");
    this.configureParams(this.config, cfg, "oe", String, "");
    this.configureParams(this.config, cfg, "endTime", String, "");
    this.configureParams(this.config, cfg, "processType", String, "");
    if (cfg.docker) {
      this.configureParams(this.config.docker, cfg.docker, "image", String, "");
      this.configureParams(this.config.docker, cfg.docker, "memory", Number, "");
      this.configureParams(this.config.docker, cfg.docker, "cpu", String, "");
      this.configureParams(this.config.docker, cfg.docker, "ports", null, []);
      this.configureParams(this.config.docker, cfg.docker, "maxSpace", Number, 0);
      this.configureParams(this.config.docker, cfg.docker, "cpusetCpus", String, "");
      this.configureParams(this.config.docker, cfg.docker, "io", Number, 0);
      this.configureParams(this.config.docker, cfg.docker, "network", Number, 0);
      this.configureParams(this.config.docker, cfg.docker, "networkMode", String, "bridge");
    }
    if (cfg.pingConfig) {
      this.configureParams(this.config.pingConfig, cfg.pingConfig, "ip", String, "");
      this.configureParams(this.config.pingConfig, cfg.pingConfig, "port", Number, 25565);
      this.configureParams(this.config.pingConfig, cfg.pingConfig, "type", Number, 1);
    }
    if (cfg.eventTask) {
      this.configureParams(this.config.eventTask, cfg.eventTask, "autoStart", Boolean, false);
      this.configureParams(this.config.eventTask, cfg.eventTask, "autoRestart", Boolean, false);
      this.configureParams(this.config.eventTask, cfg.eventTask, "ignore", Boolean, false);
    }

    StorageSubsystem.store("InstanceConfig", this.instanceUuid, this.config);
  }

  // 修改实例信息
  configureParams(self: any, args: any, key: string, typeFn: Function, defval: any) {
    const v = args[key] != null ? args[key] : defval;
    if (typeFn) {
      self[key] = typeFn(v);
    } else {
      self[key] = v;
    }
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
  }

  println(level: string, text: string) {
    const str = `\n[MCSMANAGER] [${level}] ${text}\n`;
    this.emit("data", str);
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
