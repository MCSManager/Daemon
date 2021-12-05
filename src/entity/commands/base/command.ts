/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 17:43:54
 * @LastEditTime: 2021-08-14 16:32:08
 * @Description: InstanceCommand
 * @Projcet: MCSManager Daemon

 */

export default class InstanceCommand {
  constructor(public info?: string) { }
  async exec(instance: any): Promise<any> { }
}
