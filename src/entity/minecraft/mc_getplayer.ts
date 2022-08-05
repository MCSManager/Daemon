// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "../commands/base/command";
import MCServStatus from "../../common/mcping";

export default class MinecraftGetPlayersCommand extends InstanceCommand {
  constructor() {
    super("MinecraftGetPlayersCommand");
  }

  async exec(instance: Instance) {
    if (instance.config.pingConfig.ip && instance.config.pingConfig.port) {
      const player = await new MCServStatus(instance.config.pingConfig.port, instance.config.pingConfig.ip).getStatus();
      return player;
    }
    return null;
  }
}
