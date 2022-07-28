// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import Instance from "../../instance/instance";
import { encode } from "iconv-lite";
import InstanceCommand from "../base/command";

export default class GeneralSendCommand extends InstanceCommand {
  constructor() {
    super("SendCommand");
  }

  async exec(instance: Instance, buf?: any): Promise<any> {
    // 关服命令需要发送命令，但关服命令执行前会设置状态为关闭中状态。
    // 所以这里只能通过进程是否存在来执行命令
    if (!instance.process) instance.failure(new Error("命令执行失败，因为实例实际进程不存在."));
    // instance.process.write(buf);
    instance.process.write(encode(buf, instance.config.oe));
    if (instance.config.crlf === 2) return instance.process.write("\r\n");
    return instance.process.write("\n");
  }
}
