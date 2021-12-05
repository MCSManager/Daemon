/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings

 * @Description: 应用实例相关控制器
 */
import os from "os";
import osUtils from "os-utils";

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import Instance from "../entity/instance/instance";

// 系统详细信息每一段时间更新一次
var systemResources: any = null;
setInterval(() => {
  osUtils.cpuUsage((p) => {
    systemResources = {
      cpuUsage: p,
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      type: os.type(),
      // cpus: os.cpus(),
      hostname: os.hostname(),
      loadavg: os.loadavg(),
      platform: os.platform(),
      release: os.release(),
      uptime: os.uptime()
    };
  });
}, 1000);

// 获取守护进程系统基本信息
routerApp.on("info/overview", async (ctx) => {
  let total = 0;
  let running = 0;
  InstanceSubsystem.instances.forEach((v) => {
    total++;
    if (v.status() == Instance.STATUS_RUNNING) running++;
  });
  const info = {
    process: {
      cpu: process.cpuUsage().system,
      memory: process.memoryUsage().heapUsed,
      cwd: process.cwd()
    },
    instance: {
      running,
      total
    },
    system: systemResources
  };
  protocol.response(ctx, info);
});
