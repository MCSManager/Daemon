/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import SendCommand from "../cmd";

export default class PtyStopCommand extends InstanceCommand {
  constructor() {
    super("PtyStopCommand");
  }

  async exec(instance: Instance) {
    const stopCommand = instance.config.stopCommand;
    if (stopCommand.toLocaleLowerCase() == "^c")
      return instance.failure(new Error("仿真终端无法使用Ctrl+C命令关闭进程，请重新设置关服命令"));

    if (instance.status() === Instance.STATUS_STOP || !instance.process)
      return instance.failure(new Error("实例未处于运行中状态，无法进行停止"));
    instance.status(Instance.STATUS_STOPPING);

    await instance.exec(new SendCommand(stopCommand));

    instance.println(
      "INFO",
      `已执行预设的关闭命令：${stopCommand}\n如果无法关闭实例请前往实例设置更改关闭实例的正确命令，比如 exit，stop，end 等`
    );

    // 若 10 分钟后实例还处于停止中状态，则恢复状态
    const cacheStartCount = instance.startCount;
    setTimeout(() => {
      if (instance.status() === Instance.STATUS_STOPPING && instance.startCount === cacheStartCount) {
        instance.println(
          "ERROR",
          "关闭命令已发出但长时间未能关闭实例，可能是实例关闭命令错误或实例进程假死导致，现在将恢复到运行中状态，可使用强制终止指令结束进程。"
        );
        instance.status(Instance.STATUS_RUNNING);
      }
    }, 1000 * 60 * 10);

    return instance;
  }
}
