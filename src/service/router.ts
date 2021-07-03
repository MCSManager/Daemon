/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-06-23 16:09:39
 * @Description: Route navigator, used to analyze the Socket.io protocol and encapsulate and forward to a custom route
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { EventEmitter } from "events";
import { Socket } from "socket.io";
import logger from "./log";
import RouterContext from "../entity/ctx";
import { IPacket } from "../service/protocol";

// Routing controller class (singleton class)
class RouterApp extends EventEmitter {
  public readonly middlewares: Array<Function>;

  constructor() {
    super();
    this.middlewares = [];
  }

  emitRouter(event: string, ctx: RouterContext, data: any) {
    super.emit(event, ctx, data);
    return this;
  }

  on(event: string, fn: (ctx: RouterContext, data: any) => void) {
    logger.info(` Register event: ${event} `);
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
  // Register all events with Socket
  for (const event of routerApp.eventNames()) {
    socket.on(event, (protocol: IPacket) => {
      if (!protocol) return logger.info(`session $(socket.id) request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket, session, event.toString());
      routerApp.emitRouter(event as string, ctx, protocol.data);
    });
  }
  // Register all middleware with Socket
  for (const fn of routerApp.getMiddlewares()) {
    socket.use((packet, next) => {
      const protocol = packet[1];
      if (!protocol) return logger.info(`session $(socket.id) request data protocol format is incorrect`);
      const ctx = new RouterContext(protocol.uuid, socket, session);
      fn(packet[0], ctx, protocol.data, next);
    });
  }
}

logger.info("Loading routing controller and middleware...");
import "../routers/auth_router";
import "../routers/Instance_router";
import "../routers/instance_event_router";
import "../routers/file_mamanger";
logger.info(`Complete. Total routing controller ${routerApp.eventNames().length}, middleware ${routerApp.middlewares.length}.`);
