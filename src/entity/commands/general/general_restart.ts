// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";

export default class GeneralRestartCommand extends InstanceCommand {
  constructor() {
    super("GeneralRestartCommand");
  }

  async exec(instance: Instance) {
    try {
      instance.println("INFO", "重启实例计划开始执行...");
      await instance.execPreset("stop");
      instance.setLock(true);
      const startCount = instance.startCount;
      // 每秒检查实例状态，如果实例状态为已停止，则立刻重启服务器
      const task = setInterval(async () => {
        try {
          if (startCount !== instance.startCount) {
            throw new Error("重启实例状态错误，实例已被启动过，上次状态的重启计划取消");
          }
          if (instance.status() !== Instance.STATUS_STOPPING && instance.status() !== Instance.STATUS_STOP) {
            throw new Error("重启实例状态错误，实例状态应该为停止中状态，现在变为正在运行，重启计划取消");
          }
          if (instance.status() === Instance.STATUS_STOP) {
            instance.println("INFO", "检测到服务器已停止，正在重启实例...");
            await instance.execPreset("start");
            instance.setLock(false);
            clearInterval(task);
          }
        } catch (error) {
          clearInterval(task);
          instance.setLock(false);
          instance.failure(error);
        }
      }, 1000);
    } catch (error) {
      instance.setLock(false);
      instance.failure(error);
    }
  }
}
