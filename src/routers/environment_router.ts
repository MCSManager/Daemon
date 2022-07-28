// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

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

// 获取本系统网络列表
routerApp.on("environment/networkModes", async (ctx, data) => {
  try {
    const docker = new DockerManager().getDocker();
    const result = await docker.listNetworks();
    protocol.response(ctx, result);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 创建镜像
routerApp.on("environment/new_image", async (ctx, data) => {
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
