/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 09:57:43
 * @LastEditTime: 2021-08-02 21:14:45
 * @Description:
 * @Projcet: MCSManager Daemon
 */

import Instance from "../../instance/instance";
import { ProcessConfig } from "../../instance/process_config";
import InstanceCommand from "../../commands/command";

export default class MinecraftJavaConfig extends InstanceCommand {
  constructor() {
    super("MinecraftJavaConfig");
  }

  async exec(instance: Instance) {
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "server.properties",
        redirect: "server.properties",
        path: `${instance.absoluteCwdPath()}/server.properties`,
        type: "properties",
        info: `Minecraft 服务端极其重要的配置文件，几乎绝大部分常用配置（端口，人数，视距等）均在此文件中进行编辑`,
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );

    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "spigot.yml",
        redirect: "spigot.yml",
        path: `${instance.absoluteCwdPath()}/spigot.yml`,
        type: "yml",
        info: "Spigot 配置文件",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );

    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "permissions.yml",
        redirect: "permissions.yml",
        path: `${instance.absoluteCwdPath()}/permissions.yml`,
        type: "yml",
        info: "基本权限配置文件",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );

    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "commands.yml",
        redirect: "commands.yml",
        path: `${instance.absoluteCwdPath()}/commands.yml`,
        type: "yml",
        info: "Bukkit 原始命令文件，一般情况无需改动", from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "bukkit.yml",
        redirect: "bukkit.yml",
        path: `${instance.absoluteCwdPath()}/bukkit.yml`,
        type: "yml",
        info: "Bukkit 原始配置文件", from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );

    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "whitelist.json",
        path: `${instance.absoluteCwdPath()}/whitelist.json`,
        type: "json",
        info: "服务器白名单",
        redirect: "server.properties",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "ops.json",
        path: `${instance.absoluteCwdPath()}/ops.json`,
        type: "json",
        info: "服务器管理员列表",
        redirect: "server.properties",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "eula.txt",
        path: `${instance.absoluteCwdPath()}/eula.txt`,
        type: "properties",
        info: "软件最终用户协议，此协议必须设置同意，否则无法启用服务端软件",
        redirect: "server.properties",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "banned-players.json",
        path: `${instance.absoluteCwdPath()}/banned-players.json`,
        type: "json",
        info: "已封禁玩家列表",
        redirect: "server.properties",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
    instance.processConfigs.push(
      new ProcessConfig({
        fileName: "banned-ips.json",
        path: `${instance.absoluteCwdPath()}/banned-ips.json`,
        type: "json",
        info: "已封禁IP地址列表",
        redirect: "server.properties",
        from: "Suwings",
        fromLink: "https://github.com/Suwings"
      })
    );
  }
}
