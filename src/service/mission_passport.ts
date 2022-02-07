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
