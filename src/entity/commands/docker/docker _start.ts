/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  

  版权所有 (C) 2021 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
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
    const stream = (this.stream = await this.container.attach({ stream: true, stdout: true, stderr: true, stdin: true }));
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
    } catch (error) {}
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
    const instanceStatus = instance.status();
    if (instanceStatus != Instance.STATUS_STOP) return instance.failure(new StartupDockerProcessError("实例未处于关闭状态，无法再进行启动"));
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
      let maxMemory = 0;
      if (instance.config.docker.memory) maxMemory = instance.config.docker.memory * 1024 * 1024;

      // 输出启动日志
      logger.info("----------------");
      logger.info(`会话 ${source}: 请求开启实例`);
      logger.info(`实例标识符: [${instance.instanceUuid}]`);
      logger.info(`启动命令: ${commandList.join(" ")}`);
      logger.info(`工作目录: ${cwd}`);
      logger.info(`端口: ${JSON.stringify(publicPortArray)}`);
      logger.info(`内存限制: ${maxMemory} MB`);
      logger.info(`类型: Docker 容器`);
      logger.info("----------------");

      // 开始 Docker 容器创建并运行
      const docker = new Docker();
      const container = await docker.createContainer({
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
          PortBindings: publicPortArray
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
