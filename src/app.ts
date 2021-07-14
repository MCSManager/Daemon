/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-07-14 17:23:32
 * @Description: Daemon service startup file
 */

console.log(`______  _______________________  ___                                         
___   |/  /_  ____/_  ___/__   |/  /_____ _____________ _______ _____________
__  /|_/ /_  /    _____ \\__  /|_/ /_  __  /_  __ \\  __  /_  __  /  _ \\_  ___/
_  /  / / / /___  ____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /    
/_/  /_/  \\____/  /____/ /_/  /_/  \\__,_/ /_/ /_/\\__,_/ _\\__, / \\___//_/     
________                                                /____/                                          
___  __ \\_____ ____________ ________________ 
__  / / /  __  /  _ \\_  __  __ \\  __ \\_  __ \\
_  /_/ // /_/ //  __/  / / / / / /_/ /  / / /
/_____/ \\__,_/ \\___//_/ /_/ /_/\\____//_/ /_/ Version 1.0
`);

import http from "http";
import Koa from "koa";
import koaBody from "koa-body";
import { Server, Socket } from "socket.io";

import logger from "./service/log";
logger.info(`Welcome to use MCSManager daemon.`);

import { globalConfiguration } from "./entity/config";
import * as router from "./service/router";
import * as protocol from "./service/protocol";
import InstanceSubsystem from "./service/system_instance";

// 初始化全局配置服务
globalConfiguration.load();
const config = globalConfiguration.config;

// 初始化 Koa 框架
const koaApp = new Koa();
koaApp.use(koaBody({
  multipart: true,
}))

// 装载 HTTP 服务路由
import koaRouter from "./routers/http_router";
koaApp.use(koaRouter.routes()).use(koaRouter.allowedMethods());

// 初始化 HTTP 服务
const httpServer = http.createServer(koaApp.callback());
httpServer.listen(config.port);

// 初始化 Websocket 服务
const io = new Server(httpServer, {
  serveClient: false,
  pingInterval: 3000,
  pingTimeout: 5000,
  cookie: false
});

// 初始化应用实例系统 & 装载应用实例
try {
  logger.info("Loading local instance file...");
  InstanceSubsystem.loadInstances();
  logger.info(`All local instances are loaded, a total of ${InstanceSubsystem.instances.size}.`);
} catch (err) {
  logger.error("Failed to read the local instance file, this problem must be fixed to start:", err);
  process.exit(-1);
}

// 注册 Websocket 连接事件
io.on("connection", (socket: Socket) => {
  logger.info(`Session ${socket.id}(${socket.handshake.address}) is connected.`);

  // Join the global Socket object
  protocol.addGlobalSocket(socket);

  // Socket.io request is forwarded to the custom routing controller
  router.navigation(socket);

  // Disconnect event
  socket.on("disconnect", () => {
    // Remove from the global Socket object
    protocol.delGlobalSocket(socket);
    for (const name of socket.eventNames()) socket.removeAllListeners(name);
    logger.info(`Session ${socket.id}(${socket.handshake.address}) disconnected`);
  });
});

// Error report monitoring
process.on("uncaughtException", function (err) {
  logger.error(`Error report (uncaughtException):`, err);
});

// Error report monitoring
process.on("unhandledRejection", (reason, p) => {
  logger.error(`Error report (unhandledRejection):`, reason, p);
});

// Started up
logger.info(`The daemon has started successfully.`);
logger.info("--------------------");
logger.info(`Monitoring ${config.port} port, waiting for data...`);
logger.info(`Access Key (Key): ${config.key}`);
logger.info("It is recommended to use the exit command to close the exit program.");
logger.info("--------------------");
console.log("");

// 装载 终端界面UI
import "./service/ui";

process.on("SIGINT", function () {
  try {
    console.log("\n\n\n\n");
    logger.warn("SIGINT close process signal detected.");
    InstanceSubsystem.exit();
    logger.info("The data is saved, thanks for using, goodbye!");
    logger.info("Closed.");
  } catch (err) {
    logger.error("ERROR:", err);
  } finally {
    process.exit(0);
  }
});
