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
