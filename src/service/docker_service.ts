// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import dockerode from "dockerode";
import Docker from "dockerode";

export class DockerManager {
  // 1=creating 2=creating completed -1=creating error
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
      // Set the current image creation progress
      DockerManager.setBuilerProgress(dockerImageName, 1);
      // Issue the create image command
      const stream = await this.docker.buildImage(
        {
          context: dockerFileDir,
          src: ["Dockerfile"]
        },
        { t: dockerImageName }
      );
      // wait for creation to complete
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
      });
      // Set the current image creation progress
      DockerManager.setBuilerProgress(dockerImageName, 2);
    } catch (error) {
      // Set the current image creation progress
      DockerManager.setBuilerProgress(dockerImageName, -1);
    }
  }
}
