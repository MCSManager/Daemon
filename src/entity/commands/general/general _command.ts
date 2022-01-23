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
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您必须保留所有版权声明，如果修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
*/

import Instance from "../../instance/instance";
import { encode } from "iconv-lite";
import InstanceCommand from "../base/command";

export default class GeneralSendCommand extends InstanceCommand {
  constructor() {
    super("SendCommand");
  }

  async exec(instance: Instance, text?: string): Promise<any> {
    // 关服命令需要发送命令，但关服命令执行前会设置状态为关闭中状态。
    // 所以这里只能通过进程是否存在来执行命令
    if (!instance.process) {
      instance.failure(new Error("命令执行失败，因为实例实际进程不存在."));
    }
    instance.process.write(encode(text, instance.config.oe));
    instance.process.write("\n");
  }
}
