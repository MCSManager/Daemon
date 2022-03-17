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

import Instance from "../instance/instance";
import logger from "../../service/log";
import fs from "fs-extra";

import InstanceCommand from "./base/command";
import * as childProcess from "child_process";
import FunctionDispatcher from "./dispatcher";

class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default class StartCommand extends InstanceCommand {
  public source: string;

  constructor(source = "Unknown") {
    super("StartCommand");
    this.source = source;
  }

  async exec(instance: Instance) {
    // 状态检查
    const instanceStatus = instance.status();
    if (instanceStatus !== Instance.STATUS_STOP) return instance.failure(new StartupError("实例未处于关闭状态，无法再进行启动"));

    // 到期时间检查
    const endTime = new Date(instance.config.endTime).getTime();
    if (endTime) {
      const currentTime = new Date().getTime();
      if (endTime <= currentTime) {
        return instance.failure(new Error("实例使用到期时间已到，无法再启动实例"));
      }
    }

    // 无限启动检查
    const currentTimestamp = new Date().getTime();
    const intervals = 10 * 1000;
    if (instance.startTimestamp && currentTimestamp - instance.startTimestamp < intervals) {
      const unbanss = Number((intervals - (currentTimestamp - instance.startTimestamp)) / 1000).toFixed(0);
      return instance.failure(new Error(`两次启动间隔太短，本次请求被拒绝，请 ${unbanss} 秒后再试`));
    }
    // 更新上次启动时间戳
    instance.startTimestamp = currentTimestamp;

    return await instance.execPreset("start", this.source);
  }
}
