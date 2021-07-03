/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-06-23 16:29:13
 * @Description: 定义网络协议与常用发送/广播/解析功能，客户端也应当拥有此文件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { Socket } from "socket.io";
import RouterContext from "../entity/ctx";
import logger from "./log";

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
  const packet = new Packet(ctx.uuid, STATUS_ERR, ctx.event, err.toString());
  logger.error(`会话 ${ctx.socket.id} 在 ${ctx.event} 路由中处理时错误:\n`, err);
  ctx.socket.emit(ctx.event, packet);
}

export function msg(ctx: RouterContext, event: string, data: any) {
  const packet = new Packet(ctx.uuid, STATUS_OK, event, data);
  ctx.socket.emit(event, packet);
}

export function error(ctx: RouterContext, event: string, err: any) {
  const packet = new Packet(ctx.uuid, STATUS_ERR, event, err);
  logger.error(`会话 ${ctx.socket.id} 在 ${event} 中发送错误:\n`, err);
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
