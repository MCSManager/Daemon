import { ChildProcess } from "child_process";
// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { v4 } from "uuid";
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
import { downloadFileToLocalFile } from "../download";

// singleton pattern

export class HiPer {
  public static subProcess: ChildProcess;

  public static openHiPer(keyPath: string) {}

  public static stopHiPer() {}
}

export class HiPerTask extends EventEmitter implements IAsyncTask {
  public taskId: string;
  public instance: Instance;

  public readonly KEY_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "key.yml"));
  public readonly POINT_YML = path.normalize(path.join(process.cwd(), "lib", "hiper", "point.yml"));
  private readonly BASE_URL = "https://cert.mcer.cn";

  private keyYmlPath: string;
  private pointYmlPath: string;
  private _status = 0; // 0=stop 1=running -1=error 2=downloading

  constructor(public readonly instanceUuid: string, public readonly indexCode: string) {
    super();
    this.taskId = `HiPerTask-${instanceUuid}-${v4()}`;
  }

  async start() {
    this._status = 1;
    this.emit("started");
    try {
      // Download hiper key.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/${this.indexCode}.yml`, this.KEY_YML);

      // Download hiper point.yml
      await downloadFileToLocalFile(`${this.BASE_URL}/point.yml`, this.KEY_YML);

      // TODO: The node information in point.yml is overwritten to key.yml
      // fs.writeFile()
      let keyFile = fs.readFileSync(this.KEY_YML, "utf-8");
      const pointFile = fs.readFileSync(this.POINT_YML, "utf-8");
      const START_TEXT = ">>> AUTO SYNC AREA";
      const END_TEXT = "<<< AUTO SYNC AREA";
      const start = pointFile.indexOf(START_TEXT);
      const end = pointFile.indexOf(END_TEXT);
      if (start > -1 && end > -1) {
        const nodesText = pointFile.slice(start, end);
        const p1 = keyFile.indexOf(START_TEXT);
        const p2 = keyFile.indexOf(END_TEXT);
        if (p1 >= 0 || p2 >= 0) {
          keyFile = keyFile.replace(keyFile.slice(p1, p2), "");
        }
        keyFile += "\n" + nodesText;
      }

      // Start Command: hiper.exe -config .\key.yml
      HiPer.openHiPer(this.keyYmlPath);
    } catch (error) {
      logger.error("HiPer Task Error:", error);
      this.emit("failure");
    } finally {
      this.stop();
    }
  }

  async stop() {
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
