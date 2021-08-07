/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 11:32:08
 * @LastEditTime: 2021-07-29 14:43:42
 * @Description:
 * @Projcet: MCSManager Daemon
 */

import { ILifeCycleTask } from "../../instance/life_cycle";
import Instance from "../../instance/instance";

export default class RefreshPlayer implements ILifeCycleTask {
  public name: string = "RefreshPlayer";
  public status: number = 0;

  private task: any = null;

  async start(instance: Instance) {
    console.log("启动任务");
    this.task = setInterval(async () => {
      console.log("定时任务执行中....");
      const result = await instance.presetCommandManager.execPreset("getPlayer");
      console.log("玩家人数获取结果:", result);
    }, 3000);
  }

  async stop(instance: Instance) {
    console.log("任务结束");
    clearInterval(this.task);
  }
}
