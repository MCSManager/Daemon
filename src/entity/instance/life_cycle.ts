/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 11:30:11
 * @LastEditTime: 2021-08-01 19:38:53
 * @Description:
 * @Projcet: MCSManager Daemon
 */
import Instance from "./instance";

export interface ILifeCycleTask {
  name: string;
  status: number;
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
