/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 11:32:08
 * @LastEditTime: 2021-08-08 15:49:43
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
    this.task = setInterval(async () => {
      // {
      //   host: 'localhost',
      //   port: 28888,
      //   status: true,
      //   version: '1.17.1',
      //   motd: 'A Minecraft Server',
      //   current_players: '0',
      //   max_players: '20',
      //   latency: 1
      // }
      try {
        const result = await instance.execPreset("getPlayer");
        if (!result) return;
        instance.info.maxPlayers = result.max_players ? result.max_players : -1;
        instance.info.currentPlayers = result.current_players ? result.current_players : -1;
        instance.info.version = result.version ? result.version : ""
      } catch (error) { }
    }, 3000);
  }

  async stop(instance: Instance) {
    instance.info.maxPlayers = -1;
    instance.info.currentPlayers = -1;
    instance.info.version = "";
    clearInterval(this.task);
  }
}
