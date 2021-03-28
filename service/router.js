/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-28 08:40:34
 * @Description: 路由导航器，用于分析 Socket.io 协议并封装转发到自定义路由
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const fs = require("fs-extra");
const path = require("path");
const { EventEmitter } = require("events");
// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");
const { logger } = require("./log");

// 路由控制器类（单例类）
class RouterApp extends EventEmitter {
  constructor() {
    super();
    this.middlewares = [];
  }

  /**
   * @param {string} event
   * @param {Socket} socket
   * @param {string} data
   */
  emit(event, socket, data) {
    super.emit(event, socket, data);
    return this;
  }

  /**
   * @param {string} event event
   * @param {(socket: Socket, data: string) => void} fn Function(socket: Socket, data: string)
   * @return {RouterApp}
   */
  on(event, fn) {
    logger.info(`  注册: ${event} 事件`);
    return super.on(event, fn);
  }

  /**
   * 装载中间件
   * @param {(event: string, socket: Socket, data: string, next: Function) => void} fn
   */
  use(fn) {
    this.middlewares.push(fn);
  }

  /**
   * @return {Function[]}
   */
  getMiddlewares() {
    return this.middlewares;
  }
}

// 路由控制器单例类
const routerApp = new RouterApp();
module.exports.routerApp = routerApp;


/**
 * 基于 Socket.io 进行路由分散与二次转发
 * @param {Socket} socket
 */
module.exports.navigation = (socket) => {
  // 向 Socket 注册所有事件
  for (const event of routerApp.eventNames()) {
    socket.on(event, (data) => {
      logger.info(`收到 ${socket.id}(${socket.handshake.address}) 的 ${event} 指令.`);
      logger.info(`    数据: ${JSON.stringify(data)}.`);
      routerApp.emit(event, socket, data);
    });
  }
  // 向 Socket 注册所有中间件
  for (const fn of routerApp.getMiddlewares()) {
    socket.use((packet, next) => fn(packet[0], socket, packet[1], next));
  }
}

// 导入所有路由层类
function importController() {
  logger.info("正在装载路由控制器与中间件...");
  const routerPath = path.normalize(path.join(__dirname, "../controller/"));
  const jsList = fs.readdirSync(routerPath);
  for (var name of jsList) {
    name = name.split(".")[0];
    logger.info("路由文件: " + path.join(routerPath, name) + ".js");
    require(path.join(routerPath, name));
  }
  logger.info(`装载完毕，总路由控制器${routerApp.eventNames().length}个，中间件${routerApp.middlewares.length}个.`);
}
importController();
