/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
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
