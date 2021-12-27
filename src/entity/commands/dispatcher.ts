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
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
*/

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import RefreshPlayer from "./task/players";
import MinecraftUpdateCommand from "../minecraft/mc_update";
import MinecraftGetPlayersCommand from "../minecraft/mc_getplayer";
import NullCommand from "./nullfunc";
import GeneralStartCommand from "./general/general _start";
import GeneralStopCommand from "./general/general _stop";
import GeneralKillCommand from "./general/general _kill";
import GeneralSendCommand from "./general/general _command";
import GeneralRestartCommand from "./general/general _restart";
import DockerStartCommand from "./docker/docker _start";
import TimeCheck from "./task/time";
import MinecraftBedrockGetPlayersCommand from "../minecraft/mc_getplayer_bedrock";

// 实例功能调度器
// 根据不同的类型调度分配不同的功能
export default class FuntionDispatcher extends InstanceCommand {
  constructor() {
    super("FuntionDispatcher");
  }

  async exec(instance: Instance) {
    // 初始化所有模块
    instance.lifeCycleTaskManager.clearLifeCycleTask();
    instance.clearPreset();

    // 实例必须装载的组件
    instance.lifeCycleTaskManager.registerLifeCycleTask(new TimeCheck());

    // 根据实例启动类型来进行基本操作方式的预设
    if (!instance.config.processType || instance.config.processType === "general") {
      instance.setPreset("start", new GeneralStartCommand());
      instance.setPreset("write", new GeneralSendCommand());
      instance.setPreset("stop", new GeneralStopCommand());
      instance.setPreset("kill", new GeneralKillCommand());
      instance.setPreset("restart", new GeneralRestartCommand());
    }
    if (instance.config.processType === "docker") {
      instance.setPreset("start", new DockerStartCommand());
      instance.setPreset("write", new GeneralSendCommand());
      instance.setPreset("stop", new GeneralStopCommand());
      instance.setPreset("kill", new GeneralKillCommand());
      instance.setPreset("restart", new GeneralRestartCommand());
    }

    // 根据不同类型设置不同预设功能与作用
    if (instance.config.type.includes(Instance.TYPE_UNIVERSAL)) {
      instance.setPreset("update", new NullCommand());
      instance.setPreset("getPlayer", new NullCommand());
    }
    if (instance.config.type.includes(Instance.TYPE_MINECRAFT_JAVA)) {
      instance.setPreset("update", new MinecraftUpdateCommand());
      instance.setPreset("getPlayer", new MinecraftGetPlayersCommand());
      instance.lifeCycleTaskManager.registerLifeCycleTask(new RefreshPlayer());
    }
    if (instance.config.type.includes(Instance.TYPE_MINECRAFT_BEDROCK)) {
      instance.setPreset("update", new NullCommand());
      instance.setPreset("getPlayer", new MinecraftBedrockGetPlayersCommand());
      instance.lifeCycleTaskManager.registerLifeCycleTask(new RefreshPlayer());
    }
  }
}
