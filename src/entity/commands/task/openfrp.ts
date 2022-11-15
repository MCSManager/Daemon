// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { v4 } from "uuid";
import fs from "fs-extra";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import os from "os";
import { killProcess } from "../../../common/process_tools";
import { ILifeCycleTask } from "../../instance/life_cycle";
import Instance from "../../instance/instance";
import KillCommand from "../kill";
import logger from "../../../service/log";
import { $t } from "../../../i18n";

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

// When the instance is running, continue to check the expiration time
export default class OpenFrpTask implements ILifeCycleTask {
  public status: number = 0;
  public name: string = "openfrp";

  async start(instance: Instance) {}

  async stop(instance: Instance) {}
}
