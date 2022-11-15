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

class OpenFrp {
  public process: ChildProcess;
  public fileName: string = os.platform() === "win32" ? "openfrp.exe" : "openfrp";
  public filePath: string;

  public open(keyPath: string) {
    if (this.process) {
      throw new Error($t("quick_install.openfrpError"));
    }
    this.filePath = path.normalize(path.join(process.cwd(), "lib", "openfrp", this.fileName));
    logger.info("Start openfrp:", this.filePath);
    this.process = spawn(this.fileName, {
      cwd: path.dirname(this.filePath),
      stdio: "pipe",
      windowsHide: true
    });

    if (!this.process.pid) throw new Error("OpenFrp program start failed! Pid is null!");
    this.process.on("exit", (code) => {});
  }

  public stop() {
    try {
      if (this.process.exitCode == null) {
        killProcess(this.process.pid, this.process);
      }
      this.process = null;
    } catch (error) {}
  }
}

export class OpenFrpTask extends AsyncTask {
  public static readonly TYPE = "OpenFrpTask";
  public static ip: string = null;

  constructor(public readonly indexCode: string) {
    super();
    this.taskId = `${OpenFrpTask.TYPE}-${v4()}`;
    this.type = OpenFrpTask.TYPE;
  }

  async onStarted(): Promise<boolean | void> {
    try {
    } catch (error) {
      this.error(error);
    }
  }

  onStopped(): Promise<boolean | void> {
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
