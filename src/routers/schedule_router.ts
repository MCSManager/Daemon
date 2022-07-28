// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { routerApp } from "../service/router";
import * as protocol from "../service/protocol";
import InstanceControlSubsystem from "../service/system_instance_control";

// 创建计划任务
routerApp.on("schedule/register", (ctx, data) => {
  try {
    InstanceControlSubsystem.registerScheduleJob(data);
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 获取任务列表
routerApp.on("schedule/list", (ctx, data) => {
  protocol.response(ctx, InstanceControlSubsystem.listScheduleJob(data.instanceUuid));
});

// 删除任务计划
routerApp.on("schedule/delete", (ctx, data) => {
  InstanceControlSubsystem.deleteScheduleTask(data.instanceUuid, data.name);
  protocol.response(ctx, true);
});
