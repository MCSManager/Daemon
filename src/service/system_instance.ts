// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import fs from "fs-extra";
import path from "path";
import os from "os";

import Instance from "../entity/instance/instance";
import EventEmitter from "events";
import KillCommand from "../entity/commands/kill";
import logger from "./log";

import { v4 } from "uuid";
import { Socket } from "socket.io";
import StorageSubsystem from "../common/system_storage";
import InstanceConfig from "../entity/instance/Instance_config";
import InstanceStreamListener from "../common/instance_stream";
import { QueryMapWrapper } from "../common/query_wrapper";
import FunctionDispatcher from "../entity/commands/dispatcher";
import InstanceControl from "./system_instance_control";
import StartCommand from "../entity/commands/start";

const INSTANCE_DATA_DIR = path.join(process.cwd(), "data/InstanceData");
if (!fs.existsSync(INSTANCE_DATA_DIR)) {
  fs.mkdirsSync(INSTANCE_DATA_DIR);
}

class InstanceSubsystem extends EventEmitter {
  public readonly LOG_DIR = "data/InstanceLog/";

  public readonly instances = new Map<string, Instance>();
  public readonly instanceStream = new InstanceStreamListener();

  constructor() {
    super();
  }

  // 开机自动启动
  private autoStart() {
    this.instances.forEach((instance) => {
      if (instance.config.eventTask.autoStart) {
        instance
          .exec(new StartCommand())
          .then(() => {
            logger.info($t("system_instance.autoStart", { name: instance.config.nickname, uuid: instance.instanceUuid }));
          })
          .catch((reason) => {
            logger.error(
              $t("system_instance.autoStartErr", { name: instance.config.nickname, uuid: instance.instanceUuid, reason: reason })
            );
          });
      }
    });
  }

  // init all instances from local files
  loadInstances() {
    const instanceConfigs = StorageSubsystem.list("InstanceConfig");
    instanceConfigs.forEach((uuid) => {
      try {
        const instanceConfig = StorageSubsystem.load("InstanceConfig", InstanceConfig, uuid);
        const instance = new Instance(uuid, instanceConfig);
        // 所有实例全部进行功能调度器
        instance
          .forceExec(new FunctionDispatcher())
          .then((v) => {})
          .catch((v) => {});
        this.addInstance(instance);
      } catch (error) {
        logger.error($t("system_instance.readInstanceFailed", { uuid: uuid, error: error.message }));
        logger.error($t("system_instance.checkConf", { uuid: uuid }));
      }
    });
    // 处理自动启动
    this.autoStart();
  }

  createInstance(cfg: any) {
    const newUuid = v4().replace(/-/gim, "");
    const instance = new Instance(newUuid, new InstanceConfig());
    // 实例工作目录验证与自动创建
    if (!cfg.cwd || cfg.cwd === ".") {
      cfg.cwd = path.normalize(`${INSTANCE_DATA_DIR}/${instance.instanceUuid}`);
      if (!fs.existsSync(cfg.cwd)) fs.mkdirsSync(cfg.cwd);
    }
    // 设置默认输入输出编码
    cfg.ie = cfg.oe = cfg.fileCode = "utf8";
    // 根据参数构建并初始化类型
    instance.parameters(cfg);
    instance.forceExec(new FunctionDispatcher());
    this.addInstance(instance);
    return instance;
  }

  addInstance(instance: Instance) {
    if (instance.instanceUuid == null) throw new Error($t("system_instance.uuidEmpty"));
    if (this.instances.has(instance.instanceUuid)) {
      throw new Error(`The application instance ${instance.instanceUuid} already exists.`);
    }
    this.instances.set(instance.instanceUuid, instance);
    // Dynamically monitor the newly added instance output stream and pass it to its own event stream
    instance.on("data", (...arr) => {
      this.emit("data", instance.instanceUuid, ...arr);
    });
    instance.on("exit", (...arr) => {
      this.emit(
        "exit",
        {
          instanceUuid: instance.instanceUuid,
          instanceName: instance.config.nickname
        },
        ...arr
      );
    });
    instance.on("open", (...arr) => {
      this.emit(
        "open",
        {
          instanceUuid: instance.instanceUuid,
          instanceName: instance.config.nickname
        },
        ...arr
      );
    });
    instance.on("failure", (...arr) => {
      this.emit(
        "failure",
        {
          instanceUuid: instance.instanceUuid,
          instanceName: instance.config.nickname
        },
        ...arr
      );
    });
  }

  removeInstance(instanceUuid: string, deleteFile: boolean) {
    const instance = this.getInstance(instanceUuid);
    if (instance) {
      instance.destroy();
      // 销毁记录
      this.instances.delete(instanceUuid);
      StorageSubsystem.delete("InstanceConfig", instanceUuid);
      // 删除计划任务
      InstanceControl.deleteInstanceAllTask(instanceUuid);
      // 异步删除文件
      if (deleteFile) fs.remove(instance.config.cwd, (err) => {});
      return true;
    }
    throw new Error("Instance does not exist");
  }

  forward(targetInstanceUuid: string, socket: Socket) {
    try {
      this.instanceStream.requestForward(socket, targetInstanceUuid);
    } catch (err) {}
  }

  stopForward(targetInstanceUuid: string, socket: Socket) {
    try {
      this.instanceStream.cannelForward(socket, targetInstanceUuid);
    } catch (err) {}
  }

  forEachForward(instanceUuid: string, callback: (socket: Socket) => void) {
    this.instanceStream.forwardViaCallback(instanceUuid, (_socket) => {
      callback(_socket);
    });
  }

  getInstance(instanceUuid: string) {
    return this.instances.get(instanceUuid);
  }

  getQueryMapWrapper() {
    return new QueryMapWrapper(this.instances);
  }

  exists(instanceUuid: string) {
    return this.instances.has(instanceUuid);
  }

  async exit() {
    let promises = [];
    for (const iterator of this.instances) {
      const instance = iterator[1];
      if (instance.status() != Instance.STATUS_STOP) {
        logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) is running or busy, and is being forced to end.`);
        promises.push(
          instance.execCommand(new KillCommand()).then(() => {
            StorageSubsystem.store("InstanceConfig", instance.instanceUuid, instance.config);
            logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) saved successfully.`);
          })
        );
      }
    }
    await Promise.all(promises);
  }
}

export default new InstanceSubsystem();
