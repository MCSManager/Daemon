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
import InstanceCommand from "../commands/base/command";
import MCServStatus from "../../common/mcping";

export default class MinecraftGetPlayersCommand extends InstanceCommand {
  constructor() {
    super("MinecraftGetPlayersCommand");
  }

  async exec(instance: Instance) {
    // console.log("正在执行具体获取Minecraft服务器人数的方法");
    if (instance.config.pingConfig.ip && instance.config.pingConfig.port) {
      const player = await new MCServStatus(instance.config.pingConfig.port, instance.config.pingConfig.ip).getStatus();
      return player;
    }
    return null;
  }
}
