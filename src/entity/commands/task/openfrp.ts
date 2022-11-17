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
import { processWrapper } from "../../../common/process_tools";

export class OpenFrp {
  public processWrapper: processWrapper;
  public fileName: string = os.platform() === "win32" ? "openfrp.exe" : "openfrp";
  public filePath: string;

  constructor(public readonly token: string, public readonly tunnelId: string) {}

  public open() {
    if (this.processWrapper) {
      throw new Error($t("quick_install.openfrpError"));
    }
    this.filePath = path.normalize(path.join(process.cwd(), "lib", "openfrp", this.fileName));
    logger.info("Start openfrp:", this.filePath);

    // ./frpc -u 用户密钥 -p 隧道ID
    this.processWrapper = new processWrapper(this.fileName, ["-u", this.token, "-p", this.tunnelId], path.dirname(this.filePath));
    this.processWrapper.start();
  }

  public stop() {
    try {
      if (this.processWrapper.exitCode() == null) {
        this.processWrapper.kill();
      }
      this.processWrapper = null;
    } catch (error) {}
  }
}

export default class OpenFrpTask implements ILifeCycleTask {
  public status: number = 0;
  public name: string = "openfrp";

  async start(instance: Instance) {
    const { openFrpToken, openFrpTunnelId, isOpenFrp } = instance.config?.extraServiceConfig;
    if (openFrpToken && openFrpTunnelId && isOpenFrp) {
      const frpProcess = new OpenFrp(openFrpToken, openFrpTunnelId);
      frpProcess.processWrapper.on("start", () => {
        instance.openFrp = frpProcess;
        instance.info.openFrpStatus = true;
      });
      frpProcess.processWrapper.on("exit", () => {
        instance.info.openFrpStatus = false;
        instance.openFrp = null;
      });
      frpProcess.open();
    }
  }

  async stop(instance: Instance) {
    if (instance.openFrp) {
      const frpProcess = instance.openFrp;
      frpProcess.stop();
    }
  }
}
