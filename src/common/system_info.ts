/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-08-02 11:03:31
 * @LastEditTime: 2021-08-02 13:26:30
 * @Description:
 */

import os from "os";
import osUtils from "os-utils";

interface ISystemInfo {
  cpuUsage: number;
  memUsage: number;
  totalmem: number;
  freemem: number;
  type: string;
  hostname: string;
  platform: string;
  release: string;
  uptime: number;
  cwd: string;
  processCpu: number;
  processMem: number;
}

// 系统详细信息每一段时间更新一次
let systemResources: ISystemInfo = null;
setInterval(() => {
  osUtils.cpuUsage((p) => {
    systemResources = {
      cpuUsage: p,
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      type: os.type(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      uptime: os.uptime(),
      cwd: process.cwd(),
      processCpu: process.cpuUsage().system,
      processMem: process.memoryUsage().rss,
      memUsage: (os.totalmem() - os.freemem()) / os.totalmem()
    };
  });
}, 1000);

export function systemInfo() {
  return systemResources;
}
