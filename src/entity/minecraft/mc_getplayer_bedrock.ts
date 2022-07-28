// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

const dgram = require("dgram");

import Instance from "../instance/instance";
import InstanceCommand from "../commands/base/command";

// Get Minecraft Bedrock server MOTD information
// Author: https://github.com/Mcayear
async function request(ip: string, port: number) {
  const message = Buffer.from(
    "01 00 00 00 00 00 06 18 20 00 FF FF 00 FE FE FE FE FD FD FD FD 12 34 56 78 A3 61 1C F8 BA 8F D5 60".replace(/ /g, ""),
    "hex"
  );
  const client = dgram.createSocket("udp4");
  var Config = {
    ip,
    port
  };
  return new Promise((r, j) => {
    client.on("error", (err: any) => {
      try {
        client.close();
      } catch (error) {}
      j(err);
    });
    client.on("message", (data: any) => {
      const result = data.toString().split(";");
      r(result);
      client.close();
    });
    client.send(message, Config.port, Config.ip, (err: any) => {
      if (err) {
        j(err);
        client.close();
      }
    });
    setTimeout(() => {
      j("request timeout");
      try {
        client.close();
      } catch (error) {}
    }, 5000);
  });
}

// 适配至 MCSManager 生命周期任务
export default class MinecraftBedrockGetPlayersCommand extends InstanceCommand {
  constructor() {
    super("MinecraftBedrockGetPlayersCommand");
  }

  async exec(instance: Instance) {
    if (instance.config.pingConfig.ip && instance.config.pingConfig.port) {
      const info: any = await request(instance.config.pingConfig.ip, instance.config.pingConfig.port);
      return {
        version: info[3],
        motd: info[0],
        current_players: info[4],
        max_players: info[5]
      };
    }
    return null;
  }
}
