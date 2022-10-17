import { v4 } from "uuid";
import axios from "axios";
import { pipeline, Readable } from "stream";
import fs from "fs-extra";
import Instance from "../entity/instance/instance";
import InstanceSubsystem from "../service/system_instance";
import InstanceConfig from "../entity/instance/Instance_config";
import { $t } from "../i18n";
import path from "path";
import { getFileManager } from "../service/file_router_service";

export interface IQuickTask {
  uid: string;
  start(): void;
  stop(): void;
  status(): number;
}

export class QuickInstallTask implements IQuickTask {
  private _status = 0; // 0=stop 1=running -1=error 2=downloading
  public uid: string;
  private instance: Instance;
  private readonly TMP_ZIP_NAME = "tmp.zip";
  private zipPath = "";
  private downloadStream: fs.WriteStream = null;

  constructor(public instanceName: string, public targetLink: string) {
    this.uid = v4();
    const config = new InstanceConfig();
    config.nickname = instanceName;
    config.cwd = null;
    config.stopCommand = "stop";
    config.type = Instance.TYPE_MINECRAFT_JAVA;
    this.instance = InstanceSubsystem.createInstance(config);
  }

  private download() {
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
    try {
      await this.download();
      const fileManager = getFileManager(this.instance.instanceUuid);
      console.log("OK!!!!");
    } catch (error) {
      console.log("Task error:", error);
      this._status = -1;
    }
  }

  stop() {
    this.downloadStream.destroy(new Error("STOP TASK"));
    this._status = 0;
  }
  status(): number {
    return this._status;
  }
}

export class TaskCenter {
  public static tasks = new Array<IQuickTask>();
  public static addTask(t: IQuickTask) {
    TaskCenter.tasks.push(t);
  }
}

export function createQuickInstallTask(targetLink: string, instanceName: string) {
  const task = new QuickInstallTask("123", instanceName);
  TaskCenter.addTask(task);
  task.start();

  setTimeout(() => task.stop(), 3000);
  return task;
}

createQuickInstallTask("23333", "http://oss.duzuii.com/d/MCSManager/MCSManager_v9.6.0_win_x64.zip");
