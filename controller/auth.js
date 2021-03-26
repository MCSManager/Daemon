/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 15:43:23
 * @Description: 
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const { routerApp } = require("../service/router");
const protocol = require("../service/protocol");
const { config } = require("../entity/config");
const { logger } = require("../service/log");

// 权限认证中间件
routerApp.use((event, socket, data, next) => {
  // 除 auth 控制器是公开访问，其他控制器必须得到授权才可访问
  if (event === "auth") return next();
  if (socket.session.key !== config.key) {
    protocol.error(socket, "error", "权限不足，非法访问");
    return;
  }
  next();
});

// 身份认证控制器
routerApp.on("auth", (socket, data) => {
  if (data === config.key) {
    logger.info(`会话 ${socket.id} 验证身份成功`);
    protocol.msg(socket, "auth", true);
    socket.session.key = data;
  } else {
    protocol.msg(socket, "auth", false);
  }
});
