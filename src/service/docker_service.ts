/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import dockerode from "dockerode";
import Docker from "dockerode";

export class DockerManager {
  // 1=正在创建 2=创建完毕 -1=创建错误
  public static readonly builerProgress = new Map<string, number>();

  public docker: Docker = null;

  constructor(p?: any) {
    this.docker = new Docker(p);
  }

  public getDocker() {
    return this.docker;
  }

  public static setBuilerProgress(imageName: string, status: number) {
    DockerManager.builerProgress.set(imageName, status);
  }

  public static getBuilerProgress(imageName: string) {
    return DockerManager.builerProgress.get(imageName);
  }

  async startBuildImage(dockerFileDir: string, dockerImageName: string) {
    try {
      // 设置当前镜像创建进度
      DockerManager.setBuilerProgress(dockerImageName, 1);
      // 发出创建镜像指令
      const stream = await this.docker.buildImage(
        {
          context: dockerFileDir,
          src: ["Dockerfile"]
        },
        { t: dockerImageName }
      );
      // 等待创建完毕
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
      });
      // 设置当前镜像创建进度
      DockerManager.setBuilerProgress(dockerImageName, 2);
    } catch (error) {
      // 设置当前镜像创建进度
      DockerManager.setBuilerProgress(dockerImageName, -1);
    }
  }
}
