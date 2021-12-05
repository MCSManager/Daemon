/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-09-08 15:09:17
 * @LastEditTime: 2021-09-08 15:24:44
 * @Description:
 * @Projcet: MCSManager Daemon
 */

import { ILifeCycleTask } from "../../instance/life_cycle";
import Instance from "../../instance/instance";
import KillCommand from '../kill';

// 实例运行时，继续检查到期时间
export default class TimeCheck implements ILifeCycleTask {
  public status: number = 0;
  public name: string = "TimeCheck";

  private task: any = null;

  async start(instance: Instance) {
    this.task = setInterval(async () => {
      const endTime = new Date(instance.config.endTime).getTime();
      if (endTime) {
        const currentTime = new Date().getTime()
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
