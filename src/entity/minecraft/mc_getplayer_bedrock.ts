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
  

  版权所有 (C) 2021 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
*/

const dgram = require("dgram");

import Instance from "../instance/instance";
import InstanceCommand from "../commands/base/command";

// Get Minecraft Bedrock server MOTD information
// Author: https://github.com/Mcayear
async function request(ip: string, port: number) {
  const message = Buffer.from("01 00 00 00 00 00 06 18 20 00 FF FF 00 FE FE FE FE FD FD FD FD 12 34 56 78 A3 61 1C F8 BA 8F D5 60".replace(/ /g, ""), "hex");
  const client = dgram.createSocket("udp4");
  var Config = {
    ip,
    port
  };
  return new Promise((r, j) => {
    client.on("error", (err: any) => {
      j(err);
    });
    client.on("message", (data: any) => {
      const result = data.toString().split(";");
      r(result);
      client.close();
    });
    client.send(message, Config.port, Config.ip, (err: any) => {
      if (err) j(err);
    });
    setTimeout(() => j("request timeout"), 5000);
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
