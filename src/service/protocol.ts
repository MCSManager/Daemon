/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
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
  constructor(public uuid: string = null, public status = 200, public event: string = null, public data: any = null) {}
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
  // 忽略因为重启守护进程没有刷新网页的权限不足错误
  if (err.toString().includes("[Unauthorized Access]")) return ctx.socket.emit(ctx.event, packet);
  logger.warn(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address})/${ctx.event} 响应数据时异常:\n`, err);
  ctx.socket.emit(ctx.event, packet);
}

export function msg(ctx: RouterContext, event: string, data: any) {
  const packet = new Packet(ctx.uuid, STATUS_OK, event, data);
  ctx.socket.emit(event, packet);
}

export function error(ctx: RouterContext, event: string, err: any) {
  const packet = new Packet(ctx.uuid, STATUS_ERR, event, err);
  // 忽略因为重启守护进程没有刷新网页的权限不足错误
  if (err.toString().includes("[Unauthorized Access]")) return ctx.socket.emit(ctx.event, packet);
  logger.warn(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address})/${event} 响应数据时异常:\n`, err);
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
