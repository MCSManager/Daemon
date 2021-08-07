/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-08-02 19:56:23
 * @Description: 身份认证控制器组
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import { routerApp } from "../service/router";
import * as protocol from "../service/protocol";
import { globalConfiguration } from "../entity/config";
import logger from "../service/log";
import RouterContext from "../entity/ctx";

// 顶级权限认证中间件（任何权限验证中间件此为第一位）
routerApp.use((event, ctx, _, next) => {
  const socket = ctx.socket;
  // 放行所有数据流控制器
  if (event.startsWith("stream")) return next();
  // 除 auth 控制器是公开访问，其他业务控制器必须得到授权才可访问
  if (event === "auth") return next();
  if (!ctx.session) throw new Error("Session does not exist in authentication middleware.");
  // 若未验证则阻止除 auth 事件外的所有事件
  if (ctx.session.key !== globalConfiguration.config.key || !ctx.session.login || !ctx.session.id) {
    logger.warn(`会话 ${socket.id}(${socket.handshake.address}) 试图无权限访问 ${event} 现已阻止.`);
    return protocol.error(ctx, "error", "权限不足，非法访问");
  }
  next();
});

// 日志输出中间件
// routerApp.use((event, ctx, data, next) => {
//   try {
//     const socket = ctx.socket;
//     logger.info(`收到 ${socket.id}(${socket.handshake.address}) 的 ${event} 指令.`);
//     logger.info(` - 数据: ${JSON.stringify(data)}.`);
//   } catch (err) {
//     logger.error("日志记录错误:", err);
//   } finally {
//     next();
//   }
// });

// 身份认证控制器
routerApp.on("auth", (ctx, data) => {
  if (data === globalConfiguration.config.key) {
    // 身份认证通过，注册会话为可信会话
    logger.info(`会话 ${ctx.socket.id}(${ctx.socket.handshake.address}) 验证身份成功`);
    loginSuccessful(ctx, data);
    protocol.msg(ctx, "auth", true);
  } else {
    protocol.msg(ctx, "auth", false);
  }
});

// 登录成功后必须执行此函数
function loginSuccessful(ctx: RouterContext, data: string) {
  ctx.session.key = data;
  ctx.session.login = true;
  ctx.session.id = ctx.socket.id;
  return ctx.session;
}
