/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-08-02 11:03:31
 * @LastEditTime: 2021-12-25 15:50:21
 * @Description:
 */

import os from "os";
import osUtils from "os-utils";
import systeminformation from "systeminformation";

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
  loadavg: number[];
}

// 系统详细信息每一段时间更新一次
let info: ISystemInfo = {
  type: os.type(),
  hostname: os.hostname(),
  platform: os.platform(),
  release: os.release(),
  uptime: os.uptime(),
  cwd: process.cwd(),
  loadavg: os.loadavg(),
  freemem: 0,
  cpuUsage: 0,
  memUsage: 0,
  totalmem: 0,
  processCpu: 0,
  processMem: 0
};

// 定时刷新缓存
setInterval(() => {
  systeminformation.mem((data) => {
    info.freemem = data.available;
    info.totalmem = data.total;
    info.memUsage = (data.total - data.available) / data.total;
  });
  osUtils.cpuUsage((p) => {
    info.cpuUsage = p;
  });
}, 2000);

export function systemInfo() {
  return info;
}
