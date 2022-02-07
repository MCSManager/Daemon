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

// Using SLT (Server List Ping) provided by Minecraft.
// Since it is part of the protocol it is always enabled contrary to Query
// More information at: https://wiki.vg/Server_List_Ping#Response
// Github: https://github.com/Vaksty/mcping

import net from "net";

function formatMotd(motd: any) {
  let noSpaces = motd.replace(/\u0000/g, "");
  Buffer.from(noSpaces);
  // let noColor = noSpaces.toString().replace(/[^\x00-\x7F]/g, '');
  // console.log(Buffer.from(motd, 'utf8').toString('hex'));
  // console.log(noColor);
}

export default class MCServStatus {
  public port: number;
  public host: string;
  public status: any;

  constructor(port: number, host: string) {
    this.port = port;
    this.host = host;
    this.status = {
      online: null,
      version: null,
      motd: null,
      current_players: null,
      max_players: null,
      latency: null
    };
  }

  getStatus() {
    return new Promise((resolve, reject) => {
      var start_time = new Date().getTime();
      const client = net.connect(this.port, this.host, () => {
        this.status.latency = Math.round(new Date().getTime() - start_time);
        // 0xFE packet identifier for a server list ping
        // 0x01 server list ping's payload (always 1)
        let data = Buffer.from([0xfe, 0x01]);
        client.write(data);
      });

      // The client can also receive data from the server by reading from its socket.
      client.on("data", (response: any) => {
        // Check the readme for a simple explanation
        var server_info = response.toString().split("\x00\x00");

        this.status = {
          host: this.host,
          port: this.port,
          status: true,
          version: server_info[2].replace(/\u0000/g, ""),
          motd: server_info[3].replace(/\u0000/g, ""),
          current_players: server_info[4].replace(/\u0000/g, ""),
          max_players: server_info[5].replace(/\u0000/g, ""),
          latency: this.status.latency
        };
        formatMotd(server_info[3]);
        // Request an end to the connection after the data has been received.
        client.end();
        resolve(this.status);
      });

      client.on("end", () => {
        // console.log('Requested an end to the TCP connection');
      });

      client.on("error", (err: any) => {
        reject(err);
      });
    });
  }

  async asyncStatus() {
    let status = await this.getStatus();
    return status;
  }
}
