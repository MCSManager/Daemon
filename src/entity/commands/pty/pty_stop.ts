// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../../../i18n";
import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import SendCommand from "../cmd";

export default class PtyStopCommand extends InstanceCommand {
  constructor() {
    super("PtyStopCommand");
  }

  async exec(instance: Instance) {
    const stopCommand = instance.config.stopCommand;
    if (stopCommand.toLocaleLowerCase() == "^c") return instance.failure(new Error($t("pty_stop.ctrlC")));

    if (instance.status() === Instance.STATUS_STOP || !instance.process) return instance.failure(new Error($t("pty_stop.notRunning")));
    instance.status(Instance.STATUS_STOPPING);

    await instance.exec(new SendCommand(stopCommand));

    instance.println("INFO", $t("pty_stop.execCmd", { stopCommand: stopCommand }));

    // 若 10 分钟后实例还处于停止中状态，则恢复状态
    const cacheStartCount = instance.startCount;
    setTimeout(() => {
      if (instance.status() === Instance.STATUS_STOPPING && instance.startCount === cacheStartCount) {
        instance.println("ERROR", $t("pty_stop.stopErr"));
        instance.status(Instance.STATUS_RUNNING);
      }
    }, 1000 * 60 * 10);

    return instance;
  }
}
