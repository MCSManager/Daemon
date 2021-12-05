/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-09-08 15:18:39
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../instance/instance";
import logger from "../../service/log";
import fs from "fs-extra";

import InstanceCommand from "./base/command";
import * as childProcess from "child_process";
import FuntionDispatcher from "./dispatcher";

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
    const endTime = new Date(instance.config.endTime).getTime();
    if (endTime) {
      const currentTime = new Date().getTime()
      if (endTime <= currentTime) {
        throw new Error("实例使用到期时间已到，无法再启动实例");
      }
    }
    return await instance.execPreset("start", this.source);
  }
}
