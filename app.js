/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2020-11-23 17:51:11
 * @Description: 守护进程启动文件
 */

const { config } = require("./service/config");
const { logger } = require("./service/log");

logger.info(`欢迎使用 Daemon 程序.`);

const io = require("socket.io")(config.port, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 10000,
  cookie: false
});

const router = require("./service/router");
const protocol = require("./service/protocol");

io.on("connection", (socket) => {
  logger.info(`会话 ${socket.id} 已链接`);

  // 加入到全局Socket对象
  protocol.addGlobalSocket(socket);

  // Socket.io 请求转发到自定义路由控制器
  router.navigation(socket);

  // 断开事件
  socket.on("disconnect", () => {
    // 从全局Socket对象移除
    protocol.delGlobalSocket(socket);
    socket.removeAllListeners(socket.eventNames());
    logger.info(`会话 ${socket.id} 已断开`);
  });
});

// 错误报告监听
process.on("uncaughtException", function (err) {
  logger.error(`错误报告(uncaughtException): ${err}`);
});

// 错误报告监听
process.on("unhandledRejection", (reason, p) => {
  logger.error(`错误报告(unhandledRejection): ${reason}\n${p}`);
});

// 启动完毕
logger.info(`守护进程已成功启动.`);
logger.info(`正在监听 ${config.port} 端口，等待数据...`);
