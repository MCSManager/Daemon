/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-07-29 14:43:24
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import Instance from "../instance/instance";
import { encode } from "iconv-lite";
import InstanceCommand from "./command";

export default class SendCommand extends InstanceCommand {
  public cmd: string;

  constructor(cmd: string) {
    super("SendCommand");
    this.cmd = cmd;
  }

  async exec(instance: Instance) {
    // 关服命令需要发送命令，但关服命令执行前会设置状态为关闭中状态。
    // 所以这里只能通过进程是否存在来执行命令
    if (!instance.process) {
      return instance.failure(new Error("命令执行失败，因为实例实际进程不存在."));
    }
    instance.process.stdin.write(encode(this.cmd, instance.config.oe));
    instance.process.stdin.write("\n");
    return this;
  }
}
