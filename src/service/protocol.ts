/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您被禁止删除所有相关版权声明，若需修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
*/

import { Socket } from "socket.io";
import RouterContext from "../entity/ctx";
import logger from "./log";

// 定义网络协议与常用发送/广播/解析功能，客户端也应当拥有此文件

const STATUS_OK = 200;
const STATUS_ERR = 500;

// 数据包格式定义
export interface IPacket {
  uuid?: string;
  status: number;
  event: string;
  data: any;
}

// 全局 Socket 储存
const globalSocket = new Map<String, Socket>();

export class Packet implements IPacket {
  constructor(public uuid: string = null, public status = 200, public event: string = null, public data: any = null) { }
}

export function response(ctx: RouterContext, data: any) {
  const packet = new Packet(ctx.uuid, STATUS_OK, ctx.event, data);
  ctx.socket.emit(ctx.event, packet);
}

export function responseError(ctx: RouterContext, err: Error | string) {
  let errinfo: any = "";
  if (err) errinfo = err.toString();
  else errinfo = err;
  const packet = new Packet(ctx.uuid, STATUS_ERR, ctx.event, errinfo);
  logger.error(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address})/${ctx.event} 响应数据时异常:\n`, err);
  ctx.socket.emit(ctx.event, packet);
}

export function msg(ctx: RouterContext, event: string, data: any) {
  const packet = new Packet(ctx.uuid, STATUS_OK, event, data);
  ctx.socket.emit(event, packet);
}

export function error(ctx: RouterContext, event: string, err: any) {
  const packet = new Packet(ctx.uuid, STATUS_ERR, event, err);
  logger.error(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address})/${event} 响应数据时异常:\n`, err);
  ctx.socket.emit(event, packet);
}

export function parse(text: IPacket) {
  if (typeof text == "object") {
    return new Packet(text.uuid || null, text.status, text.event, text.data);
  }
  const obj = JSON.parse(text);
  return new Packet(null, obj.status, obj.event, obj.data);
}

export function stringify(obj: any) {
  return JSON.stringify(obj);
}

export function addGlobalSocket(socket: Socket) {
  globalSocket.set(socket.id, socket);
}

export function delGlobalSocket(socket: Socket) {
  globalSocket.delete(socket.id);
}

export function socketObjects() {
  return globalSocket;
}

// 全局 Socket 广播
export function broadcast(event: string, obj: any) {
  globalSocket.forEach((socket) => {
    msg(new RouterContext(null, socket), event, obj);
  });
}
