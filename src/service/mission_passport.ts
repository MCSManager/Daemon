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

// 任务接口
interface IMission {
  name: string;
  parameter: any;
  start: number;
  end: number;
  count?: number;
}

// 任务护照管理器
class MissionPassport {
  // 临时任务护照列表
  public readonly missions = new Map<string, IMission>();

  constructor() {
    // 设置每一小时检查一次任务到期情况
    setInterval(() => {
      const t = new Date().getTime();
      this.missions.forEach((m, k) => {
        if (t > m.end) this.missions.delete(k);
      });
    }, 1000);
  }

  // 注册任务护照
  public registerMission(password: string, mission: IMission) {
    if (this.missions.has(password)) throw new Error("Duplicate primary key, failed to create task");
    this.missions.set(password, mission);
  }

  // 根据护照与任务名获取任务
  public getMission(password: string, missionName: string) {
    if (!this.missions.has(password)) return null;
    const m = this.missions.get(password);
    if (m.name === missionName) return m;
    return null;
  }

  public deleteMission(password: string) {
    this.missions.delete(password);
  }
}

const missionPassport = new MissionPassport();

export { missionPassport, IMission };
