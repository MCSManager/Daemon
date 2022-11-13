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

interface IHiPerReactive {
  stop(): any;
}

// singleton pattern
class HiPer {
  public static hiperProcess: ChildProcess;
  public static hiperFileName: string = os.platform() === "win32" ? "hiper.exe" : "hiper";
  public static hiperFilePath: string;

  public static openHiPer(keyPath: string, task?: IHiPerReactive) {
    if (HiPer.hiperProcess) {
      throw new Error($t("quick_install.hiperError"));
    }
    HiPer.hiperFilePath = path.normalize(path.join(process.cwd(), "lib", "hiper", HiPer.hiperFileName));
    logger.info("Start HiPer:", path.dirname(HiPer.hiperFilePath), HiPer.hiperFileName);
    HiPer.hiperProcess = spawn(HiPer.hiperFileName, {
      cwd: path.dirname(HiPer.hiperFilePath),
      stdio: "pipe",
      windowsHide: true
    });

    if (!HiPer.hiperProcess.pid) throw new Error("HiPer program start failed! Pid is null!");
    // HiPer.hiperProcess.stdout.on("data", (text: Buffer) => {});
    HiPer.hiperProcess.on("exit", (code) => {
      if (task) task.stop();
    });
  }

  public static stopHiPer() {
    try {
      if (HiPer.hiperProcess.exitCode == null) {
        killProcess(HiPer.hiperProcess.pid, HiPer.hiperProcess);
      }
      HiPer.hiperProcess = null;
    } catch (error) {}
  }
}

export class OpenFrpTask extends AsyncTask {
  public static readonly TYPE = "OpenFrpTask";
  public static ip: string = null;

  public readonly KEY_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "config.yml"));
  public readonly POINT_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "point.yml"));
  private readonly BASE_URL = "https://cert.mcer.cn";

  constructor(public readonly indexCode: string) {
    super();
    this.taskId = `${OpenFrpTask.TYPE}-${v4()}`;
    this.type = OpenFrpTask.TYPE;
  }

  async onStarted(): Promise<boolean | void> {
    try {
      // Download hiper key.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/${this.indexCode}.yml`, this.KEY_YML);

      // Download hiper point.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/point.yml`, this.POINT_YML);

      // The node information in point.yml is overwritten to key.yml
      let keyFile = fs.readFileSync(this.KEY_YML, "utf-8");
      const firstLine = keyFile.split("\n")[0];
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

      // parse ip
      // TEXT: # This is the hiper minimization configuration file. - (6.0.0.28/7)
      const pattern = /(\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3})/g;
      const ip = firstLine.match(pattern);
      if (ip && ip.length > 0) {
        OpenFrpTask.ip = ip[0];
      }

      // Start Command: hiper.exe -config .\key.yml
      HiPer.openHiPer(this.KEY_YML, this);
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
        status: this.status(),
        ip: OpenFrpTask.ip
      })
    );
  }
}

export function openOpenFrpTask(indexCode: string) {
  const task = new OpenFrpTask(indexCode);
  TaskCenter.addTask(task);
  return task;
}
