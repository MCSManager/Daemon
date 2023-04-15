import { $t } from "../../../i18n";
// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../../instance/instance";
import { encode } from "iconv-lite";
import InstanceCommand from "../base/command";
import Rcon from "rcon-srcds";

export default class RconCommand extends InstanceCommand {
  constructor() {
    super("SendCommand");
  }

  async exec(instance: Instance, buf?: string): Promise<any> {
    if (!instance.process) instance.failure(new Error($t("command.instanceNotOpen")));
    const rconCfg = instance.config.pingConfig;
    const server = new Rcon({ host: rconCfg.ip || "localhost", port: rconCfg.port, encoding: "utf8" });
    try {
      await server.authenticate(rconCfg.password);
      instance.println("RCON", buf);

      const response = await server.execute(buf);
      instance.print(String(response));
    } catch (e) {
      instance.println("RCON ERROR", String(e));
    } finally {
      server.disconnect();
    }
  }
}
