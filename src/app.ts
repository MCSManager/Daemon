/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-12-05 15:42:16
 * @Description: Daemon service startup file
 */

import { getVersion, initVersionManager } from "./service/version";
initVersionManager();
const VERSION = getVersion();

console.log(`______  _______________________  ___                                         
___   |/  /_  ____/_  ___/__   |/  /_____ _____________ _______ _____________
__  /|_/ /_  /    _____ \\__  /|_/ /_  __  /_  __ \\  __  /_  __  /  _ \\_  ___/
_  /  / / / /___  ____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /    
/_/  /_/  \\____/  /____/ /_/  /_/  \\__,_/ /_/ /_/\\__,_/ _\\__, / \\___//_/     
________                                                /____/                                          
___  __ \\_____ ____________ ________________ 
__  / / /  __  /  _ \\_  __  __ \\  __ \\_  __ \\
_  /_/ // /_/ //  __/  / / / / / /_/ /  / / /
/_____/ \\__,_/ \\___//_/ /_/ /_/\\____//_/ /_/   

 + Released under the GPL-3.0 License
 + Copyright 2021 Suwings
 + Version ${VERSION}
`);

import http from "http";

import { Server, Socket } from "socket.io";

import logger from "./service/log";
logger.info(`欢迎使用 MCSManager 守护进程`);

import { globalConfiguration } from "./entity/config";
import * as router from "./service/router";
import * as koa from "./service/http";
import * as protocol from "./service/protocol";
import InstanceSubsystem from "./service/system_instance";

// 初始化全局配置服务
globalConfiguration.load();
const config = globalConfiguration.config;

// 初始化 HTTP 服务
const koaApp = koa.initKoa();
const httpServer = http.createServer(koaApp.callback());
httpServer.listen(config.port, config.ip);

// 初始化 Websocket 服务到 HTTP 服务
const io = new Server(httpServer, {
  serveClient: false,
  pingInterval: 5000,
  pingTimeout: 5000,
  cookie: false,
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 初始化应用实例系统 & 装载应用实例
try {
  logger.info("正在读取本地应用实例中");
  InstanceSubsystem.loadInstances();
  logger.info(`所有应用实例已加载，总计 ${InstanceSubsystem.instances.size} 个`);
} catch (err) {
  logger.error("读取本地实例文件失败:", err);
  process.exit(-1);
}

// 注册 Websocket 连接事件
io.on("connection", (socket: Socket) => {
  logger.info(`会话 ${socket.id}(${socket.handshake.address}) 已连接.`);

  // Join the global Socket object
  protocol.addGlobalSocket(socket);

  // Socket.io request is forwarded to the custom routing controller
  router.navigation(socket);

  // Disconnect event
  socket.on("disconnect", () => {
    // Remove from the global Socket object
    protocol.delGlobalSocket(socket);
    for (const name of socket.eventNames()) socket.removeAllListeners(name);
    logger.info(`会话 ${socket.id}(${socket.handshake.address}) 已断开`);
  });
});

// Error report monitoring
process.on("uncaughtException", function (err) {
  logger.error(`错误报告 (uncaughtException):`, err);
});

// Error report monitoring
process.on("unhandledRejection", (reason, p) => {
  logger.error(`错误报告 (unhandledRejection):`, reason, p);
});

// Started up
logger.info(`守护进程现已成功启动`);
logger.info("================================");
logger.info(`访问地址 ${config.ip ? config.ip : "localhost"}:${config.port}`);
logger.info(`访问密钥 ${config.key}`);
logger.info("密钥作为守护进程唯一认证手段");
logger.info("================================");
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
