import InstanceCommand from "./base/command";
/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 15:58:04
 * @LastEditTime: 2021-08-14 16:52:45
 * @Description:
 * @Projcet: MCSManager Daemon
 */

export default class NullCommand extends InstanceCommand {
  constructor() {
    super("NullCommand");
  }
  async exec() {
    // Do nothing.....
  }
}
