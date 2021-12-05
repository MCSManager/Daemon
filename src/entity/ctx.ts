/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-07-15 15:56:50
 * @Projcet: MCSManager Daemon

 */

import { Socket } from "socket.io";

export default class RouterContext {
  constructor(public uuid: string, public socket: Socket, public session?: any, public event?: string) { }

  public response(data: any) {
    return this;
  }
}
