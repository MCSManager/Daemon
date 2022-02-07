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

import { DockerManager } from "../service/docker_service";
import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import * as fs from "fs-extra";
import path from "path";
import { v4 } from "uuid";
import logger from "../service/log";
import os from "os";

// 获取本系统镜像列表
routerApp.on("environment/images", async (ctx, data) => {
  try {
    if (os.platform() === "win32") return protocol.responseError(ctx, "[Unsupported] Windows 系统暂不支持此功能");
    const docker = new DockerManager().getDocker();
    const result = await docker.listImages();
    protocol.response(ctx, result);
  } catch (error) {
    protocol.responseError(ctx, "无法获取镜像信息，请确保您已正确安装Docker环境");
  }
});

// 获取本系统容器列表
routerApp.on("environment/containers", async (ctx, data) => {
  try {
    const docker = new DockerManager().getDocker();
    const result = await docker.listContainers();
    protocol.response(ctx, result);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 创建镜像
routerApp.on("environment/new_image", async (ctx, data) => {
  if (os.platform() === "win32") return protocol.responseError(ctx, "[Unsupported] Windows 系统暂不支持此功能");
  try {
    const dockerFileText = data.dockerFile;
    const name = data.name;
    const tag = data.tag;
    // 初始化镜像文件目录和 Dockerfile
    const uuid = v4();
    const dockerFileDir = path.normalize(path.join(process.cwd(), "tmp", uuid));
    if (!fs.existsSync(dockerFileDir)) fs.mkdirsSync(dockerFileDir);

    // 写入 DockerFile
    const dockerFilepath = path.normalize(path.join(dockerFileDir, "Dockerfile"));
    await fs.writeFile(dockerFilepath, dockerFileText, { encoding: "utf-8" });

    logger.info(`守护进程正在创建镜像 ${name}:${tag} DockerFile 如下:\n${dockerFileText}\n`);

    // 预先响应
    protocol.response(ctx, true);

    // 开始创建
    const dockerImageName = `${name}:${tag}`;
    try {
      await new DockerManager().startBuildImage(dockerFileDir, dockerImageName);
      logger.info(`创建镜像 ${name}:${tag} 完毕`);
    } catch (error) {
      logger.info(`创建镜像 ${name}:${tag} 错误:${error}`);
    }
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 删除镜像
routerApp.on("environment/del_image", async (ctx, data) => {
  try {
    const imageId = data.imageId;
    const docker = new DockerManager().getDocker();
    const image = docker.getImage(imageId);
    if (image) {
      logger.info(`守护进程正在删除镜像 ${imageId}`);
      await image.remove();
    } else {
      throw new Error("Image does not exist");
    }
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 获取所有镜像任务进度
routerApp.on("environment/progress", async (ctx) => {
  try {
    const data: any = {};
    DockerManager.builerProgress.forEach((v, k) => {
      data[k] = v;
    });
    protocol.response(ctx, data);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});
