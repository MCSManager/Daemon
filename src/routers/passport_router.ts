/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
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
