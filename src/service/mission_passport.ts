/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-15 15:20:54
 * @LastEditTime: 2021-07-15 15:41:00
 * @Description: 独立的临时任务护照管理，用于创建临时访问权限与临时任务
 */

// 任务接口
interface IMission {
  name: string,
  parameter: any,
  count?: number
}

// 任务护照管理器
class MissionPassport {

  // 临时任务护照列表
  public readonly missions = new Map<string, IMission>();

  // 注册任务护照
  public registerMission(password: string, mission: IMission) {
    if (this.missions.has(password))
      throw new Error("Duplicate primary key, failed to create task");
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

export {
  missionPassport,
  IMission
}