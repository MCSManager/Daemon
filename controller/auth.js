/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 身份验证相关控制器
 */

const { routerApp } = require("../service/router");
const protocol = require("../service/protocol");
const { config } = require("../service/config");
const { logger } = require("../service/log");

// 权限认证中间件
routerApp.use((event, socket, data, next) => {
  // 除 auth 控制器是公开访问，其他控制器必须得到授权才可访问
  if (event === "auth") return next();
  if (socket.session.key !== config.key) {
    protocol.sendError(socket, "error", "权限不足，非法访问");
    return;
  }
  next();
});

// 日志中间件
routerApp.use((event, socket, data, next) => {
  logger.info(`会话 ${socket.id} 访问 ${event} 控制器`);
  next();
});

// 身份认证控制器
routerApp.on("auth", (socket, data) => {
  if (data === config.key) {
    logger.info(`会话 ${socket.id} 验证身份成功`);
    protocol.send(socket, "auth", true);
    socket.session.key = data;
  } else {
    protocol.send(socket, "auth", false);
  }
});
