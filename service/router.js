/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 路由导航器，用于分析 Socket.io 协议并封装转发到自定义路由
 */

const fs = require("fs-extra");
const path = require("path");
const { EventEmitter } = require("events");
// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");

const protocol = require("./protocol");
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
    // 通过中间件的Next来激活到最后的事件
    this.execMiddlewares(0, event, socket, data);
    return this;
  }

  /**
   * @param {string} event event
   * @param {(socket: Socket, data: string) => void} fn Function(socket: Socket, data: string)
   * @return {RouterApp}
   */
  on(event, fn) {
    logger.info(`装载控制器: ${event}`);
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
   * 内部使用的中间件责任链式调用
   * @param {number} index
   * @param {string} event
   * @param {Socket} socket
   * @param {string} data
   * @return {this}
   */
  execMiddlewares(index, event, socket, data) {
    const currentFn = this.middlewares[index];
    if (!currentFn) {
      return this.LastMiddlewaresFn(event, socket, data);
    }
    try {
      currentFn(event, socket, data, () => {
        return this.execMiddlewares(index + 1, event, socket, data);
      });
    } catch (err) {
      // 这里的错误并不一定是中间件代码的错误，也有可能是最后一步的 LastMiddlewaresFn 所未捕捉的错误
      logger.error(`Middleware recursion error: ${err}`);
    }
  }

  // 默认的最后中间件函数
  LastMiddlewaresFn(...args) {
    super.emit(...args);
  }
}

// 路由控制器单例类
const routerApp = new RouterApp();
module.exports.routerApp = routerApp;

/**
 * 基于 Socket.io 进行二次转发，实现数据包事件定义
 * @param {Socket} socket
 */
module.exports.navigation = (socket) => {
  // 初始化 Session 变量
  if (!socket.session) socket.session = {};
  // 向自定义路由转发请求
  socket.on("protocol", (data) => {
    try {
      const packet = protocol.parse(data);
      if (packet.event) {
        routerApp.emit(packet.event, socket, packet.data);
      }
    } catch (err) {
      logger.error(`路由控制器业务错误: ${err}`);
    }
  });
};

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
