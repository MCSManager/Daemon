/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 09:56:00
 * @LastEditTime: 2021-09-08 15:15:01
 * @Description:
 * @Projcet: MCSManager Daemon
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
import TimeCheck from './task/time';
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
