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
