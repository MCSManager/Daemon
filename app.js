/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-28 08:50:33
 * @Description: 守护进程启动文件
 */

const { config } = require("./entity/config");
const { logger } = require("./service/log");

// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");

logger.info(`欢迎使用 Daemon 程序.`);

const io = global.io = require("socket.io")(config.port, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 10000,
  cookie: false
});

// 初始化 Session 会话变量
// 使用轻量级的会话功能
io.use((socket, next) => {
  if (!socket.session) socket.session = {};
  next();
});

const router = require("./service/router");
const protocol = require("./service/protocol");


// 注册链接事件
io.on("connection", (socket) => {
  logger.info(`会话 ${socket.id}(${socket.handshake.address}) 已链接`);

  // 加入到全局Socket对象
  protocol.addGlobalSocket(socket);

  // Socket.io 请求转发到自定义路由控制器
  router.navigation(socket);

  // 断开事件
  socket.on("disconnect", () => {
    // 从全局Socket对象移除
    protocol.delGlobalSocket(socket);
    for (const name of socket.eventNames()) socket.removeAllListeners(name);
    logger.info(`会话 ${socket.id}(${socket.handshake.address}) 已断开`);
  });
});

// 错误报告监听
process.on("uncaughtException", function (err) {
  logger.error(`错误报告(uncaughtException):`, err);
});

// 错误报告监听
process.on("unhandledRejection", (reason, p) => {
  logger.error(`错误报告(unhandledRejection):`, reason, p);
});

// 启动完毕
logger.info(`守护进程已成功启动.`);
logger.info(`正在监听 ${config.port} 端口，等待数据...`);
logger.info("-");
logger.info(`访问密匙(Key): ${config.key}`);

require("./service/ui");


