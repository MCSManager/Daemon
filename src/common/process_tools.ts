// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { ChildProcess, exec, execSync } from "child_process";
import os from "os";

export function killProcess(pid: string | number, process: ChildProcess, signal?: any) {
  try {
    if (os.platform() === "win32") {
      execSync(`taskkill /PID ${pid} /T /F`);
      console.log(`进程 ${pid} 已使用系统指令强制终止进程`);
      return true;
    }
    if (os.platform() === "linux") {
      execSync(`kill -s 9 ${pid}`);
      console.log(`进程 ${pid} 已使用系统指令强制终止进程`);
      return true;
    }
  } catch (err) {
    return signal ? process.kill(signal) : process.kill("SIGKILL");
  }
  return signal ? process.kill(signal) : process.kill("SIGKILL");
}
