/*
 * @Author: Suwings
 * @Date: 2021-12-05 15:43:50
 * @LastEditTime: 2021-12-25 15:49:43
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import Instance from "../entity/instance/instance";

import { systemInfo } from "../common/system_info";

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
    system: systemInfo()
  };
  protocol.response(ctx, info);
});
