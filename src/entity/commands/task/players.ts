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

export default class RefreshPlayer implements ILifeCycleTask {
  public name: string = "RefreshPlayer";
  public status: number = 0;

  private task: any = null;
  private playersChartTask: any = null;
  private playersChart: Array<{ value: string }> = [];

  async start(instance: Instance) {
    let chartCount = 0;
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
        instance.info.version = result.version ? result.version : "";
        if (chartCount === 0) {
          chartCount = 99;
          this.playersChart.push({
            value: result.current_players ? result.current_players : 0
          });
          if (this.playersChart.length > 60) {
            this.playersChart = this.playersChart.slice(1, this.playersChart.length);
          }
          instance.info.playersChart = this.playersChart;
        } else {
          chartCount--;
        }
      } catch (error) { }
    }, 3000);

    while (this.playersChart.length < 60) {
      this.playersChart.push({ value: "0" });
    }

    this.playersChartTask = setInterval(async () => {
      try {
        const result = await instance.execPreset("getPlayer");
        if (!result) return;
        this.playersChart.push({
          value: result.current_players ? result.current_players : 0
        });
        if (this.playersChart.length > 60) {
          this.playersChart = this.playersChart.slice(1, this.playersChart.length);
        }
        instance.info.playersChart = this.playersChart;
      } catch (error) { }
    }, 600000);
  }

  async stop(instance: Instance) {
    clearInterval(this.task);
    clearInterval(this.playersChartTask);
    instance.info.maxPlayers = -1;
    instance.info.currentPlayers = -1;
    instance.info.version = "";
    instance.info.playersChart = [];
  }
}
