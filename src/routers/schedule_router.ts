/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-07-15 16:32:50
 * @Description: 身份认证控制器组
 * @Projcet: MCSManager Daemon

 */

import { routerApp } from "../service/router";
import * as protocol from "../service/protocol";
import InstanceControlSubsystem from "../service/system_instance_control";

// 创建计划任务
routerApp.on("schedule/register", (ctx, data) => {
  InstanceControlSubsystem.registerScheduleJob(data);
  protocol.response(ctx, true);
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
