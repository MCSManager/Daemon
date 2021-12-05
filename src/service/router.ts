/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-07-26 15:18:58
 * @Description: Route navigator, used to analyze the Socket.io protocol and encapsulate and forward to a custom route
 * @Projcet: MCSManager Daemon

 */

import { EventEmitter } from "events";
import { Socket } from "socket.io";
import logger from "./log";
import RouterContext from "../entity/ctx";
import { IPacket, response, responseError } from "../service/protocol";
// Routing controller class (singleton class)
class RouterApp extends EventEmitter {
  public readonly middlewares: Array<Function>;

  constructor() {
    super();
    this.middlewares = [];
  }

  emitRouter(event: string, ctx: RouterContext, data: any) {
    try {
      // service logic routing trigger point
      super.emit(event, ctx, data);
    } catch (error) {
      responseError(ctx, error);
    }
    return this;
  }

  on(event: string, fn: (ctx: RouterContext, data: any) => void) {
    // logger.info(` Register event: ${event} `);
    return super.on(event, fn);
  }

  use(fn: (event: string, ctx: RouterContext, data: any, next: Function) => void) {
    this.middlewares.push(fn);
  }

  getMiddlewares() {
    return this.middlewares;
  }
}

// routing controller singleton class
export const routerApp = new RouterApp();

/**
 * Based on Socket.io for routing decentralization and secondary forwarding
 * @param {Socket} socket
 */
export function navigation(socket: Socket) {
  // Full-life session variables (Between connection and disconnection)
  const session: any = {};
  // Register all middleware with Socket
  for (const fn of routerApp.getMiddlewares()) {
    socket.use((packet, next) => {
      const protocol = packet[1] as IPacket;
      if (!protocol) return logger.info(`session ${socket.id} request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket, session);
      fn(packet[0], ctx, protocol.data, next);
    });
  }
  // Register all events with Socket
  for (const event of routerApp.eventNames()) {
    socket.on(event, (protocol: IPacket) => {
      if (!protocol) return logger.info(`session ${socket.id} request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket, session, event.toString());
      routerApp.emitRouter(event as string, ctx, protocol.data);
    });
  }
  // 触发已连接事件路由
  const ctx = new RouterContext(null, socket, session);
  routerApp.emitRouter("connection", ctx, null);
}

logger.info("正在读取业务路由与相关中间件...");
// 身份验证路由顺序必须是第一位装载，这些路由顺序均不可擅自改变
import "../routers/auth_router";
import "../routers/passport_router";
import "../routers/info_router";
import "../routers/Instance_router";
import "../routers/instance_event_router";
import "../routers/file_router";
import "../routers/stream_router";
import "../routers/environment_router";
import "../routers/schedule_router";

logger.info(`装载完毕, 共路由 ${routerApp.eventNames().length} 个, 中间件 ${routerApp.middlewares.length} 个`);
