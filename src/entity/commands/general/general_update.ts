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

import { ChildProcess, exec, spawn } from "child_process";
import logger from "../../../service/log";
import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import { commandStringToArray } from "../base/command_parser";
import iconv from "iconv-lite";
export default class GeneralUpdateCommand extends InstanceCommand {
  constructor() {
    super("GeneralUpdateCommand");
  }

  async exec(instance: Instance) {
    if (instance.status() !== Instance.STATUS_STOP) return instance.failure(new Error("实例状态不正确，无法执行更新任务，必须停止实例"));
    try {
      instance.setLock(true);
      const updateCommand = instance.config.updateCommand;
      logger.info(`实例 ${instance.instanceUuid} 正在准备进行更新操作...`);
      logger.info(`实例 ${instance.instanceUuid} 执行更新命令如下:`);
      logger.info(updateCommand);

      // 命令解析
      const commandList = commandStringToArray(updateCommand);
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);
      if (commandList.length === 0) {
        return instance.failure(new Error("更新命令格式错误，请联系管理员"));
      }

      // 启动更新命令
      const process = spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });
      if (!process || !process.pid) {
        instance.setLock(false);
        return instance.println("错误", "更新失败，更新命令启动失败，请联系管理员");
      }

      instance.status(Instance.STATUS_BUSY);

      process.stdout.on("data", (text) => {
        instance.println("更新", iconv.decode(text, instance.config.oe));
      });
      process.stderr.on("data", (text) => {
        instance.println("异常", iconv.decode(text, instance.config.oe));
      });
      process.on("exit", (code) => {
        instance.setLock(false);
        instance.status(Instance.STATUS_STOP);
        if (code === 0) {
          instance.println("更新", "更新成功！");
        } else {
          instance.println("更新", "更新程序结束，但结果不正确，可能文件更新损坏或网络不畅通");
        }
      });
    } catch {
      instance.setLock(false);
      instance.status(Instance.STATUS_STOP);
    }
  }
}
