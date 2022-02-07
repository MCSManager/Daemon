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

import Instance from "./instance";

export interface ILifeCycleTask {
  name: string; // 任务名
  status: number; // 运行状态，默认为0即可，任务管理器会自动改变
  start: (instance: Instance) => Promise<void>;
  stop: (instance: Instance) => Promise<void>;
}

export class LifeCycleTaskManager {
  // 生命周期任务列表
  public readonly lifeCycleTask: ILifeCycleTask[] = [];

  constructor(private self: any) {}

  registerLifeCycleTask(task: ILifeCycleTask) {
    this.lifeCycleTask.push(task);
  }

  execLifeCycleTask(type: number) {
    if (type == 1) {
      this.lifeCycleTask.forEach((v) => {
        if (v.status === 0) v.start(this.self);
        v.status = 1;
      });
    } else {
      this.lifeCycleTask.forEach((v) => {
        if (v.status === 1) v.stop(this.self);
        v.status = 0;
      });
    }
  }

  clearLifeCycleTask() {
    this.execLifeCycleTask(0);
    this.lifeCycleTask.splice(0, this.lifeCycleTask.length);
  }
}
