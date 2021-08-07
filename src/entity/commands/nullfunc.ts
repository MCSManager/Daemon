import InstanceCommand from "./command";
/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 15:58:04
 * @LastEditTime: 2021-07-29 15:59:18
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
