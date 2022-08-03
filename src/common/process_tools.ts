// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import { ChildProcess, exec, execSync } from "child_process";
import os from "os";

export function killProcess(pid: string | number, process: ChildProcess, signal?: any) {
  try {
    if (os.platform() === "win32") {
      execSync(`taskkill /PID ${pid} /T /F`);
      console.log($t("common.killProcess"), { pid: pid });
      return true;
    }
    if (os.platform() === "linux") {
      execSync(`kill -s 9 ${pid}`);
      console.log($t("common.killProcess"), { pid: pid });
      return true;
    }
  } catch (err) {
    return signal ? process.kill(signal) : process.kill("SIGKILL");
  }
  return signal ? process.kill(signal) : process.kill("SIGKILL");
}
