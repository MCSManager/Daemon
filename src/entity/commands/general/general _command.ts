/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:54
 * @Description:
 * @Projcet: MCSManager Daemon

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
