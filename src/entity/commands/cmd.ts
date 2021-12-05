/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 19:51:50
 * @LastEditTime: 2021-08-14 16:52:43
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";

export default class SendCommand extends InstanceCommand {
  public cmd: string;

  constructor(cmd: string) {
    super("SendCommand");
    this.cmd = cmd;
  }

  async exec(instance: Instance) {
    return await instance.execPreset("write", this.cmd);
  }
}
