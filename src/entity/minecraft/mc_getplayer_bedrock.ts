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
