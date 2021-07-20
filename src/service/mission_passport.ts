/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-15 15:20:54
 * @LastEditTime: 2021-07-15 16:05:03
 * @Description: 独立的临时任务护照管理，用于创建临时访问权限与临时任务
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
