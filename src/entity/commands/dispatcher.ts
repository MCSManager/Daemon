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
import path from "path";
import fs from "fs-extra";
import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import RefreshPlayer from "./task/players";
import MinecraftGetPlayersCommand from "../minecraft/mc_getplayer";
import NullCommand from "./nullfunc";
import GeneralStartCommand from "./general/general_start";
import GeneralStopCommand from "./general/general_stop";
import GeneralKillCommand from "./general/general_kill";
import GeneralSendCommand from "./general/general_command";
import GeneralRestartCommand from "./general/general_restart";
import DockerStartCommand from "./docker/docker_start";
import DockerResizeCommand from "./docker/docker_resize";
import TimeCheck from "./task/time";
import MinecraftBedrockGetPlayersCommand from "../minecraft/mc_getplayer_bedrock";
import GeneralUpdateCommand from "./general/general_update";
import PtyStartCommand from "./pty/pty_start";
import PtyStopCommand from "./pty/pty_stop";
import { PTY_PATH } from "../../const";

// 实例功能调度器
// 根据不同的类型调度分配不同的功能
export default class FunctionDispatcher extends InstanceCommand {
  constructor() {
    super("FunctionDispatcher");
  }

  async exec(instance: Instance) {
    // 初始化所有模块
    instance.lifeCycleTaskManager.clearLifeCycleTask();
    instance.clearPreset();

    // 实例必须装载的组件
    instance.lifeCycleTaskManager.registerLifeCycleTask(new TimeCheck());

    // 实例通用预设能力
    instance.setPreset("command", new GeneralSendCommand());
    instance.setPreset("stop", new GeneralStopCommand());
    instance.setPreset("kill", new GeneralKillCommand());
    instance.setPreset("restart", new GeneralRestartCommand());
    instance.setPreset("update", new GeneralUpdateCommand());

    // 根据实例启动类型来进行基本操作方式的预设
    if (!instance.config.processType || instance.config.processType === "general") {
      instance.setPreset("start", new GeneralStartCommand());
    }

    // 启用仿真终端模式
    if (
      instance.config.terminalOption.pty &&
      instance.config.terminalOption.ptyWindowCol &&
      instance.config.terminalOption.ptyWindowRow &&
      instance.config.processType === "general"
    ) {
      instance.setPreset("start", new PtyStartCommand());
      instance.setPreset("stop", new PtyStopCommand());
      instance.setPreset("resize", new NullCommand());
    }
    // 是否启用 Docker PTY 模式
    if (instance.config.processType === "docker") {
      instance.setPreset("resize", new NullCommand());
      instance.setPreset("start", new DockerStartCommand());
    }

    // 根据不同类型设置不同预设功能与作用
    if (instance.config.type.includes(Instance.TYPE_UNIVERSAL)) {
      instance.setPreset("getPlayer", new NullCommand());
    }
    if (instance.config.type.includes(Instance.TYPE_MINECRAFT_JAVA)) {
      instance.setPreset("getPlayer", new MinecraftGetPlayersCommand());
      instance.lifeCycleTaskManager.registerLifeCycleTask(new RefreshPlayer());
    }
    if (instance.config.type.includes(Instance.TYPE_MINECRAFT_BEDROCK)) {
      instance.setPreset("getPlayer", new MinecraftBedrockGetPlayersCommand());
      instance.lifeCycleTaskManager.registerLifeCycleTask(new RefreshPlayer());
    }
  }
}
