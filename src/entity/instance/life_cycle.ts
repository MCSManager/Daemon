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
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
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
