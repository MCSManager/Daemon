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

import schedule from "node-schedule";
import InstanceSubsystem from "./system_instance";
import StorageSubsystem from "../common/system_storage";
import logger from "./log";
import StartCommand from "../entity/commands/start";
import StopCommand from "../entity/commands/stop";
import SendCommand from "../entity/commands/cmd";
import RestartCommand from "../entity/commands/restart";
import KillCommand from "../entity/commands/kill";

// 计划任务配置项接口
interface IScheduleTask {
  instanceUuid: string;
  name: string;
  count: number;
  time: string;
  action: string;
  payload: string;
  type: number;
}

// 计划任务定时器/周期任务接口
interface IScheduleJob {
  cancel: Function;
}

// @Entity
// 计划任务配置数据实体类
class TaskConfig implements IScheduleTask {
  instanceUuid = "";
  name: string = "";
  count: number = 1;
  time: string = "";
  action: string = "";
  payload: string = "";
  type: number = 1;
}

class IntervalJob implements IScheduleJob {
  public job: number = 0;

  constructor(private callback: Function, public time: number) {
    this.job = setInterval(callback, time * 1000);
  }

  cancel() {
    clearInterval(this.job);
  }
}

// 计划任务实例类
class Task {
  constructor(public config: TaskConfig, public job?: IScheduleJob) { }
}

class InstanceControlSubsystem {
  public readonly taskMap = new Map<string, Array<Task>>();
  public readonly taskJobMap = new Map<string, schedule.Job>();

  constructor() {
    // 初始化所有持久化数据并逐一装载到内存
    StorageSubsystem.list("TaskConfig").forEach((uuid) => {
      const config = StorageSubsystem.load("TaskConfig", TaskConfig, uuid) as TaskConfig;
      this.registerScheduleJob(config, false);
    });
  }

  public registerScheduleJob(task: IScheduleTask, needStore = true) {
    const key = `${task.instanceUuid}`;
    if (!this.taskMap.has(key)) {
      this.taskMap.set(key, []);
    }
    if (!this.checkTask(key, task.name)) throw new Error("已存在重复的任务");
    let job: IScheduleJob;
    if (needStore) logger.info(`创建计划任务 ${task.name}:\n${JSON.stringify(task)}`);
    if (task.type === 1) {
      // task.type=1: 时间间隔型计划任务，采用内置定时器实现
      job = new IntervalJob(() => {
        this.action(task);
        if (task.count === -1) return;
        if (task.count === 1) {
          job.cancel();
          this.deleteTask(key, task.name);
        } else {
          task.count--;
          this.updateTaskConfig(key, task.name, task);
        }
      }, Number(task.time));
    } else {
      // task.type=1: 指定时间型计划任务，采用 node-schedule 库实现
      job = schedule.scheduleJob(task.time, () => {
        this.action(task);
        if (task.count === -1) return;
        if (task.count === 1) {
          job.cancel();
          this.deleteTask(key, task.name);
        } else {
          task.count--;
          this.updateTaskConfig(key, task.name, task);
        }
      });
    }
    const newTask = new Task(task, job);
    this.taskMap.get(key).push(newTask);
    if (needStore) {
      StorageSubsystem.store("TaskConfig", newTask.config.name, newTask.config);
    }
    if (needStore) logger.info(`创建计划任务 ${task.name} 完毕`);
  }

  public listScheduleJob(instanceUuid: string) {
    const key = `${instanceUuid}`;
    const arr = this.taskMap.get(key) || [];
    const res: IScheduleTask[] = [];
    arr.forEach((v) => {
      res.push(v.config);
    });
    return res;
  }

  public async action(task: IScheduleTask) {
    try {
      const payload = task.payload;
      const instanceUuid = task.instanceUuid;
      const instance = InstanceSubsystem.getInstance(instanceUuid);
      // 若实例已被删除则需自动销毁
      if (!instance) {
        return this.deleteScheduleTask(task.instanceUuid, task.name);
      }
      const instanceStatus = instance.status();
      // logger.info(`执行计划任务: ${task.name} ${task.action} ${task.time} ${task.count} `);
      if (task.action === "start") {
        if (instanceStatus === 0) {
          instance.exec(new StartCommand("ScheduleJob"));
        }
      }
      if (task.action === "stop") {
        if (instanceStatus === 3) {
          instance.exec(new StopCommand());
        }
      }
      if (task.action === "restart") {
        if (instanceStatus === 3) {
          instance.exec(new RestartCommand());
        }
      }
      if (task.action === "command") {
        if (instanceStatus === 3) {
          instance.exec(new SendCommand(payload));
        }
      }
      if (task.action === "kill") {
        instance.exec(new KillCommand());
      }
    } catch (error) {
      logger.error(`实例 ${task.instanceUuid} 计划任务 ${task.name} 执行错误: \n ${error} `);
    }
  }

  public deleteInstanceAllTask(instanceUuid: string) {
    const tasks = this.listScheduleJob(instanceUuid);
    if (tasks)
      tasks.forEach((v) => {
        this.deleteScheduleTask(instanceUuid, v.name);
      });
  }

  public deleteScheduleTask(instanceUuid: string, name: string) {
    const key = `${instanceUuid}`;
    this.deleteTask(key, name);
  }

  private deleteTask(key: string, name: string) {
    this.taskMap.get(key).forEach((v, index, arr) => {
      if (v.config.name === name) {
        v.job.cancel();
        arr.splice(index, 1);
      }
    });
    StorageSubsystem.delete("TaskConfig", name);
  }

  private checkTask(key: string, name: string) {
    let f = true;
    this.taskMap.get(key).forEach((v, index, arr) => {
      if (v.config.name === name) f = false;
    });
    return f;
  }

  private updateTaskConfig(key: string, name: string, data: IScheduleTask) {
    const list = this.taskMap.get(key);
    for (const index in list) {
      const t = list[index];
      if (t.config.name === name) {
        list[index].config = data;
        break;
      }
    }
  }
}

export default new InstanceControlSubsystem();
