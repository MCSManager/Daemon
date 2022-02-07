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
import FuntionDispatcher from "../entity/commands/dispatcher";
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
            logger.info(`实例 ${instance.config.nickname} ${instance.instanceUuid} 自动启动指令已发出`);
          })
          .catch((reason) => {
            logger.error(`实例 ${instance.config.nickname} ${instance.instanceUuid} 自动启动时错误: ${reason}`);
          });
      }
    });
  }

  // init all instances from local files
  loadInstances() {
    const instanceConfigs = StorageSubsystem.list("InstanceConfig");
    instanceConfigs.forEach((uuid) => {
      const instanceConfig = StorageSubsystem.load("InstanceConfig", InstanceConfig, uuid);
      const instance = new Instance(uuid, instanceConfig);
      // 所有实例全部进行功能调度器
      instance
        .forceExec(new FuntionDispatcher())
        .then((v) => {})
        .catch((v) => {});
      this.addInstance(instance);
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
    // 针对中文操作系统编码自动选择
    if (os.platform() === "win32") {
      cfg.ie = cfg.oe = cfg.fileCode = "gbk";
    } else {
      cfg.ie = cfg.oe = cfg.fileCode = "utf-8";
    }
    // 根据参数构建并初始化类型
    instance.parameters(cfg);
    instance.forceExec(new FuntionDispatcher());
    this.addInstance(instance);
    return instance;
  }

  addInstance(instance: Instance) {
    if (instance.instanceUuid == null) throw new Error("无法新增某实例，因为实例UUID为空");
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
    for (const iterator of this.instances) {
      const instance = iterator[1];
      if (instance.status() != Instance.STATUS_STOP) {
        logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) is running or busy, and is being forced to end.`);
        await instance.execCommand(new KillCommand());
      }
      StorageSubsystem.store("InstanceConfig", instance.instanceUuid, instance.config);
      logger.info(`Instance ${instance.config.nickname} (${instance.instanceUuid}) saved successfully.`);
    }
  }
}

export default new InstanceSubsystem();
