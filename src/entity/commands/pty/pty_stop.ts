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

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import SendCommand from "../cmd";

export default class PtyStopCommand extends InstanceCommand {
  constructor() {
    super("PtyStopCommand");
  }

  async exec(instance: Instance) {
    const stopCommand = instance.config.stopCommand;
    if (stopCommand.toLocaleLowerCase() == "^c") return instance.failure(new Error("伪终端无法使用^C命令关闭进程，请重新设置关服命令"));

    if (instance.status() === Instance.STATUS_STOP || !instance.process) return instance.failure(new Error("实例未处于运行中状态，无法进行停止"));
    instance.status(Instance.STATUS_STOPPING);

    await instance.exec(new SendCommand(stopCommand));

    instance.println("INFO", `已执行预设的关闭命令：${stopCommand}\n如果无法关闭实例请前往实例设置更改关闭实例的正确命令，比如 exit，stop，end 等`);

    // 若 10 分钟后实例还处于停止中状态，则恢复状态
    const cacheStartCount = instance.startCount;
    setTimeout(() => {
      if (instance.status() === Instance.STATUS_STOPPING && instance.startCount === cacheStartCount) {
        instance.println("ERROR", "关闭命令已发出但长时间未能关闭实例，可能是实例关闭命令错误或实例进程假死导致，现在将恢复到运行中状态，可使用强制终止指令结束进程。");
        instance.status(Instance.STATUS_RUNNING);
      }
    }, 1000 * 60 * 10);

    return instance;
  }
}
