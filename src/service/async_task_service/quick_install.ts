// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { v4 } from "uuid";
import axios from "axios";
import { pipeline, Readable } from "stream";
import fs from "fs-extra";
import Instance from "../../entity/instance/instance";
import InstanceSubsystem from "../system_instance";
import InstanceConfig from "../../entity/instance/Instance_config";
import { $t, i18next } from "../../i18n";
import path from "path";
import { getFileManager } from "../file_router_service";
import EventEmitter from "events";
import { IAsyncTask, IAsyncTaskJSON, TaskCenter } from "./index";
import logger from "../log";

export class QuickInstallTask extends EventEmitter implements IAsyncTask {
  public taskId: string;
  public instance: Instance;
  public readonly TMP_ZIP_NAME = "mcsm_install_package.zip";
  public readonly ZIP_CONFIG_JSON = "mcsmanager-config.json";
  public zipPath = "";

  private _status = 0; // 0=stop 1=running -1=error 2=downloading
  private downloadStream: fs.WriteStream = null;

  constructor(public instanceName: string, public targetLink: string) {
    super();
    const config = new InstanceConfig();
    config.nickname = instanceName;
    config.cwd = null;
    config.stopCommand = "stop";
    config.type = Instance.TYPE_MINECRAFT_JAVA;
    this.instance = InstanceSubsystem.createInstance(config);
    this.taskId = `QuickInstallTask-${this.instance.instanceUuid}-${v4()}`;
  }

  private download(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.zipPath = path.normalize(path.join(this.instance.config.cwd, this.TMP_ZIP_NAME));
      const writeStream = fs.createWriteStream(this.zipPath);
      const response = await axios<Readable>({
        url: this.targetLink,
        responseType: "stream"
      });
      this.downloadStream = pipeline(response.data, writeStream, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async start() {
    this._status = 1;
    this.emit("started");
    const fileManager = getFileManager(this.instance.instanceUuid);
    try {
      let result = await this.download();
      result = await fileManager.promiseUnzip(this.TMP_ZIP_NAME, ".", "UTF-8");
      if (!result) throw new Error($t("quick_install.unzipError"));
      const config = JSON.parse(await fileManager.readFile(this.ZIP_CONFIG_JSON));
      this.instance.parameters(config);
      this.stop();
    } catch (error) {
      logger.error("QuickInstall Task Error:", error);
      this.emit("failure");
    } finally {
      fs.remove(fileManager.toAbsolutePath(this.TMP_ZIP_NAME), () => {});
    }
  }

  async stop() {
    try {
      if (this.downloadStream) this.downloadStream.destroy(new Error("STOP TASK"));
    } catch (error) {}
    this._status = 0;
    this.emit("stopped");
  }

  failure() {
    this._status = -1;
    this.emit("failure");
  }

  status(): number {
    return this._status;
  }

  toObject(): IAsyncTaskJSON {
    return JSON.parse(
      JSON.stringify({
        taskId: this.taskId,
        status: this.status(),
        instanceUuid: this.instance.instanceUuid,
        instanceStatus: this.instance.status(),
        instanceConfig: this.instance.config
      })
    );
  }
}

export function createQuickInstallTask(targetLink: string, instanceName: string) {
  if (!targetLink || !instanceName) throw new Error("targetLink or instanceName is null!");
  const task = new QuickInstallTask(instanceName, targetLink);
  TaskCenter.addTask(task);
  return task;
}
