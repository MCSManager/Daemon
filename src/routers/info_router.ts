/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import Instance from "../entity/instance/instance";

import { systemInfo } from "../common/system_info";
import { getVersion } from "../service/version";

// 获取守护进程系统基本信息
routerApp.on("info/overview", async (ctx) => {
  const daemonVersion = getVersion();
  let total = 0;
  let running = 0;
  InstanceSubsystem.instances.forEach((v) => {
    total++;
    if (v.status() == Instance.STATUS_RUNNING) running++;
  });
  const info = {
    version: daemonVersion,
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
