/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-04-26 15:24:54
 * @LastEditTime: 2021-06-23 16:09:08
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { Socket } from "socket.io";

export default class RouterContext {
  constructor(public uuid: string, public socket: Socket, public session?: any, public event?: string) {}
}
