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
