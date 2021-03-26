/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 18:17:01
 * @Description: 身份认证控制器组
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
  if (!socket.session)
    throw new Error("Session does not exist in authentication middleware.");
  if (socket.session.key !== config.key || !socket.session.login || !socket.session.id) {
    return protocol.error(socket, "error", "权限不足，非法访问");
  }
  next();
});


// 身份认证控制器
routerApp.on("auth", (socket, data) => {
  if (data === config.key) {
    // 身份认证通过，注册会话为可信会话
    logger.info(`会话 ${socket.id} 验证身份成功`);
    loginSuccessful(socket, data);
    protocol.msg(socket, "auth", true);
  } else {
    protocol.msg(socket, "auth", false);
  }
});


// 登录成功后必须执行此函数
function loginSuccessful(socket, data) {
  socket.session.key = data;
  socket.session.login = true;
  socket.session.id = socket.id;
  return socket.session;
}