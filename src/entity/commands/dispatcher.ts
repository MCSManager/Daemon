/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 09:56:00
 * @LastEditTime: 2021-07-29 15:59:39
 * @Description:
 * @Projcet: MCSManager Daemon
 */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-29 09:56:00
 * @LastEditTime: 2021-07-29 09:57:13
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */
import Instance from "../instance/instance";
import InstanceCommand from "./command";
import RefreshPlayer from "./task/players";
import MinecraftUpdateCommand from "../minecraft/mc_update";
import MinecraftGetPlayersCommand from "../minecraft/mc_getplayer";
import MinecraftJavaConfig from "../minecraft/configuration/minecraft_java_config";
import NullCommand from "./nullfunc";

// 实例功能调度器
// 根据不同的类型调度分配不同的功能
export default class FuntionDispatcher extends InstanceCommand {
  constructor() {
    super("FuntionDispatcher");
  }

  async exec(instance: Instance) {
    // 初始化所有模块
    instance.lifeCycleTaskManager.clearLifeCycleTask();
    instance.processConfigs.splice(0, instance.processConfigs.length);
    instance.presetCommandManager.clearPreset();

    if (instance.config.type === Instance.TYPE_UNIVERSAL) {
      instance.presetCommandManager.setPreset("update", new NullCommand());
      instance.presetCommandManager.setPreset("getPlayer", new NullCommand());
    }

    // 根据不同类型设置不同预设功能与作用
    if (
      instance.config.type === Instance.TYPE_MINECRAFT_SPIGOT ||
      instance.config.type === Instance.TYPE_MINECRAFT ||
      instance.config.type === Instance.TYPE_MINECRAFT_BUNGEECORD ||
      instance.config.type === Instance.TYPE_MINECRAFT_PAPER ||
      instance.config.type === Instance.TYPE_MINECRAFT_FORGE
    ) {
      await instance.forceExec(new MinecraftJavaConfig());
      instance.presetCommandManager.setPreset("update", new MinecraftUpdateCommand());
      instance.presetCommandManager.setPreset("getPlayer", new MinecraftGetPlayersCommand());
      instance.lifeCycleTaskManager.registerLifeCycleTask(new RefreshPlayer());
    }
  }
}
