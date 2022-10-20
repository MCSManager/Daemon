// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import { ChildProcess, exec, execSync, SpawnOptionsWithoutStdio } from "child_process";
import os from "os";
import child_process from "child_process";
import path from "path";
import EventEmitter from "events";

export class CommandProcess extends EventEmitter {
  public process: ChildProcess;

  constructor(
    public readonly file: string,
    public readonly args: string[],
    public readonly cwd: string,
    public readonly timeout = 60 * 10,
    public readonly option: SpawnOptionsWithoutStdio = {}
  ) {
    super();
  }

  public start() {
    return new Promise((resolve, reject) => {
      let timeTask: NodeJS.Timeout = null;
      const process = child_process.spawn(this.file, this.args, {
        stdio: "pipe",
        windowsHide: true,
        cwd: path.normalize(this.cwd),
        ...this.option
      });
      this.process = process;
      if (!process || !process.pid) return reject(false);

      process.stdout.on("data", (text) => this.emit("data", text));
      process.stderr.on("data", (text) => this.emit("data", text));
      process.on("exit", (code) => {
        try {
          this.emit("exit", code);
          this.destroy();
        } catch (error) {}
        if (timeTask) clearTimeout(timeTask);
        if (code != 0) return resolve(false);
        return resolve(true);
      });

      // timeout, terminate the task
      timeTask = setTimeout(() => {
        killProcess(process.pid, process);
        reject(false);
      }, 1000 * this.timeout);
    });
  }

  public kill() {
    killProcess(this.process.pid, this.process);
  }

  private async destroy() {
    try {
      for (const n of this.eventNames()) this.removeAllListeners(n);
      if (this.process.stdout) for (const eventName of this.process.stdout.eventNames()) this.process.stdout.removeAllListeners(eventName);
      if (this.process.stderr) for (const eventName of this.process.stderr.eventNames()) this.process.stderr.removeAllListeners(eventName);
      if (this.process) for (const eventName of this.process.eventNames()) this.process.stdout.removeAllListeners(eventName);
      this.process?.stdout?.destroy();
      this.process?.stderr?.destroy();
      if (this.process?.exitCode === null) {
        this.process.kill("SIGTERM");
        this.process.kill("SIGKILL");
      }
    } catch (error) {
      console.log("[CommandProcess destroy() Error]", error);
    } finally {
      this.process = null;
    }
  }
}

export function killProcess(pid: string | number, process: ChildProcess, signal?: any) {
  try {
    if (os.platform() === "win32") {
      execSync(`taskkill /PID ${pid} /T /F`);
      console.log($t("common.killProcess", { pid: pid }));
      return true;
    }
    if (os.platform() === "linux") {
      execSync(`kill -s 9 ${pid}`);
      console.log($t("common.killProcess", { pid: pid }));
      return true;
    }
  } catch (err) {
    return signal ? process.kill(signal) : process.kill("SIGKILL");
  }
  return signal ? process.kill(signal) : process.kill("SIGKILL");
}
