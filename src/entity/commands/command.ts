/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 17:43:54
 * @LastEditTime: 2021-07-29 15:41:22
 * @Description: InstanceCommand
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

export default class InstanceCommand {
  constructor(public info: string) {}
  async exec(instance: any): Promise<any> {}
}
