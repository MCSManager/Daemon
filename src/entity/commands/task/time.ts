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

import { ILifeCycleTask } from "../../instance/life_cycle";
import Instance from "../../instance/instance";
import KillCommand from "../kill";

// 实例运行时，继续检查到期时间
export default class TimeCheck implements ILifeCycleTask {
  public status: number = 0;
  public name: string = "TimeCheck";

  private task: any = null;

  async start(instance: Instance) {
    this.task = setInterval(async () => {
      const endTime = new Date(instance.config.endTime).getTime();
      if (endTime) {
        const currentTime = new Date().getTime();
        if (endTime <= currentTime) {
          // 已到期，执行结束进程指令
          await instance.exec(new KillCommand());
          clearInterval(this.task);
        }
      }
    }, 1000 * 60 * 60);
  }

  async stop(instance: Instance) {
    clearInterval(this.task);
  }
}
