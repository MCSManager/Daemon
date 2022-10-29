// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { v4 } from "uuid";
import fs from "fs-extra";
import Instance from "../../entity/instance/instance";
import InstanceSubsystem from "../system_instance";
import InstanceConfig from "../../entity/instance/Instance_config";
import { $t, i18next } from "../../i18n";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { getFileManager } from "../file_router_service";
import EventEmitter from "events";
import { AsyncTask, IAsyncTask, IAsyncTaskJSON, TaskCenter } from "./index";
import logger from "../log";
import { downloadFileToLocalFile } from "../download";
import os from "os";
import { killProcess } from "../../common/process_tools";

// singleton pattern
class HiPer {
  public static hiperProcess: ChildProcess;
  public static hiperFileName: string = os.platform() === "win32" ? "hiper.exe" : "hiper";
  public static hiperFilePath: string;

  public static openHiPer(keyPath: string) {
    if (HiPer.hiperProcess) {
      throw new Error($t("quick_install.hiperError"));
    }
    HiPer.hiperFilePath = path.normalize(path.join(process.cwd(), "lib", "hiper", HiPer.hiperFileName));
    // HiPer.hiperProcess = spawn("hiper", ["-v", keyPath]);
    console.log("模拟启动成功");
  }

  public static stopHiPer() {
    killProcess(this.hiperProcess.pid, this.hiperProcess);
    HiPer.hiperProcess = null;
  }
}

export class HiPerTask extends AsyncTask {
  public static readonly TYPE = "HiPerTask";

  public readonly KEY_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "key.yml"));
  public readonly POINT_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "point.yml"));
  private readonly BASE_URL = "https://cert.mcer.cn";

  private keyYmlPath: string;
  private pointYmlPath: string;

  constructor(public readonly indexCode: string) {
    super();
    this.taskId = `${HiPerTask.TYPE}-${indexCode}-${v4()}`;
    this.type = HiPerTask.TYPE;
  }

  async onStarted(): Promise<boolean | void> {
    try {
      // Download hiper key.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/${this.indexCode}.yml`, this.KEY_YML);

      // Download hiper point.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/point.yml`, this.POINT_YML);

      // The node information in point.yml is overwritten to key.yml
      let keyFile = fs.readFileSync(this.KEY_YML, "utf-8");
      const pointFile = fs.readFileSync(this.POINT_YML, "utf-8");
      const START_TEXT = ">>> AUTO SYNC AREA";
      const END_TEXT = "<<< AUTO SYNC AREA";
      const p1 = keyFile.indexOf(START_TEXT);
      const p2 = keyFile.indexOf(END_TEXT);
      if (p1 >= 0 || p2 >= 0) {
        keyFile = keyFile.replace(keyFile.slice(p1, p2), "");
      }
      keyFile += "\n\n" + pointFile;

      fs.writeFileSync(this.KEY_YML, keyFile, "utf-8");

      // Start Command: hiper.exe -config .\key.yml
      HiPer.openHiPer(this.keyYmlPath);
    } catch (error) {
      this.error(error);
    }
  }

  onStopped(): Promise<boolean | void> {
    HiPer.stopHiPer();
    return null;
  }

  onError(err: Error): void {}

  toObject(): IAsyncTaskJSON {
    return JSON.parse(
      JSON.stringify({
        taskId: this.taskId,
        status: this.status()
      })
    );
  }
}

export function openHiPerTask(indexCode: string) {
  const task = new HiPerTask(indexCode);
  TaskCenter.addTask(task);
  return task;
}
