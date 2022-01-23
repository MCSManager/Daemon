/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您被禁止删除所有相关版权声明，若需修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
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
