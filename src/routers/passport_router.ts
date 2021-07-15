/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-07-15 16:32:50
 * @Description: 身份认证控制器组
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { routerApp } from "../service/router";
import { missionPassport } from "../service/mission_passport";
import * as protocol from "../service/protocol";

const ONE_HOUR_TIME = 3600000;
const TASK_MAX_TIME = 1;

// 注册临时任务护照
routerApp.on("passport/register", (ctx, data) => {
  const name = data.name;
  const password = data.password;
  const parameter = data.parameter;
  const count = data.count;
  const start = new Date().getTime();
  const end = start + ONE_HOUR_TIME * TASK_MAX_TIME;
  if (!name || !password) throw new Error("不可定义任务名或密钥为空");
  missionPassport.registerMission(password, {
    name,
    parameter,
    count,
    start,
    end
  });
  protocol.response(ctx, true);
});
