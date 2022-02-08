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

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import Docker from "dockerode";
import logger from "../../../service/log";
import { EventEmitter } from "events";
import { IInstanceProcess } from "../../instance/interface";
import fs from "fs-extra";
import { commandStringToArray } from "../base/command_parser";

// 用户身份函数
const processUserUid = process.getuid ? process.getuid : () => 0;
const processGroupGid = process.getgid ? process.getgid : () => 0;

// 启动时错误异常
class StartupDockerProcessError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

// Docker 进程适配器
class DockerProcessAdapter extends EventEmitter implements IInstanceProcess {
  pid?: number | string;

  private stream: NodeJS.ReadWriteStream;

  constructor(private container: Docker.Container) {
    super();
  }

  public async start() {
    await this.container.start();
    this.pid = this.container.id;
    const stream = (this.stream = await this.container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      stdin: true
    }));
    stream.on("data", (data) => this.emit("data", data));
    stream.on("error", (data) => this.emit("data", data));
    this.wait();
  }

  public write(data?: string) {
    if (this.stream) this.stream.write(data);
  }

  public kill(s?: string) {
    this.container.kill();
    return true;
  }

  public async destroy() {
    try {
      await this.container.remove();
    } catch (error) {
    }
  }

  private wait() {
    this.container.wait(async (v) => {
      this.destroy();
      this.emit("exit", v);
    });
  }
}

export default class DockerStartCommand extends InstanceCommand {
  constructor() {
    super("DockerStartCommand");
  }

  async exec(instance: Instance, source = "Unknown") {
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe) return instance.failure(new StartupDockerProcessError("启动命令，输入输出编码或工作目录为空值"));
    if (!fs.existsSync(instance.absoluteCwdPath())) return instance.failure(new StartupDockerProcessError("工作目录并不存在"));

    try {
      // 锁死实例
      instance.setLock(true);
      // 设置启动状态
      instance.status(Instance.STATUS_STARTING);
      // 启动次数增加
      instance.startCount++;

      // 命令解析
      const commandList = commandStringToArray(instance.config.startCommand);
      const cwd = instance.absoluteCwdPath();

      // 解析端口开放
      // {
      //   "PortBindings": {
      //     "22/tcp": [
      //       {
      //         "HostPort": "11022"
      //       }
      //     ]
      //   }
      // }
      // 25565:25565/tcp 8080:8080/tcp
      const portMap = instance.config.docker.ports;
      const publicPortArray: any = {};
      const exposedPorts: any = {};
      for (const iterator of portMap) {
        const elemt = iterator.split("/");
        if (elemt.length != 2) continue;
        const ports = elemt[0];
        const protocol = elemt[1];
        //主机(宿主)端口:容器端口
        const publicAndPrivatePort = ports.split(":");
        if (publicAndPrivatePort.length != 2) continue;
        publicPortArray[`${publicAndPrivatePort[1]}/${protocol}`] = [{ HostPort: publicAndPrivatePort[0] }];
        exposedPorts[`${publicAndPrivatePort[1]}/${protocol}`] = {};
      }

      // 内存限制
      let maxMemory = undefined;
      if (instance.config.docker.memory) maxMemory = instance.config.docker.memory * 1024 * 1024;

      // CPU使用率计算
      let cpuQuota = undefined;
      let cpuPeriod = undefined;
      if (instance.config.docker.cpuUsage) {
        cpuQuota = instance.config.docker.cpuUsage * 10 * 1000;
        cpuPeriod = 1000 * 1000;
      }

      // CPU 核心数校验
      let cpusetCpus = undefined;
      if (instance.config.docker.cpusetCpus) {
        const arr = instance.config.docker.cpusetCpus.split(",");
        arr.forEach((v) => {
          if (isNaN(Number(v))) throw new Error(`非法的CPU核心指定: ${v}`);
        });
        cpusetCpus = instance.config.docker.cpusetCpus;
        // Note: 检验
      }

      // 输出启动日志
      logger.info("----------------");
      logger.info(`会话 ${source}: 请求开启实例`);
      logger.info(`实例标识符: [${instance.instanceUuid}]`);
      logger.info(`容器名称: [${instance.config.docker.containerName}]`);
      logger.info(`启动命令: ${commandList.join(" ")}`);
      logger.info(`工作目录: ${cwd}`);
      logger.info(`网络模式: ${instance.config.docker.networkMode}`);
      logger.info(`端口映射: ${JSON.stringify(publicPortArray)}`);
      logger.info(`网络别名: ${JSON.stringify(instance.config.docker.networkAliases)}`);
      if (maxMemory) logger.info(`内存限制: ${maxMemory} MB`);
      logger.info(`类型: Docker 容器`);
      logger.info("----------------");

      // 开始 Docker 容器创建并运行
      const docker = new Docker();
      const container = await docker.createContainer({
        name: instance.config.docker.containerName,
        Image: instance.config.docker.image,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        User: `${processUserUid()}:${processGroupGid()}`,
        WorkingDir: "/workspace/",
        Cmd: commandList,
        OpenStdin: true,
        StdinOnce: false,
        ExposedPorts: exposedPorts,
        HostConfig: {
          Memory: maxMemory,
          Binds: [`${cwd}:/workspace/`],
          AutoRemove: true,
          CpusetCpus: cpusetCpus,
          CpuPeriod: cpuPeriod,
          CpuQuota: cpuQuota,
          PortBindings: publicPortArray,
          NetworkMode: instance.config.docker.networkMode
        },
        NetworkingConfig: {
          EndpointsConfig: {
            "aliases": {
              "Aliases": instance.config.docker.networkAliases
            }
          }
        }
      });

      const processAdapter = new DockerProcessAdapter(container);
      await processAdapter.start();

      instance.started(processAdapter);
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
