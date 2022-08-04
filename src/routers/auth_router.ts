// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import { routerApp } from "../service/router";
import * as protocol from "../service/protocol";
import { globalConfiguration } from "../entity/config";
import logger from "../service/log";
import RouterContext from "../entity/ctx";

// 最迟验证时间
const AUTH_TIMEOUT = 6000;
// 认证类型标识
const TOP_LEVEL = "TOP_LEVEL";

// 顶级权限认证中间件（任何权限验证中间件此为第一位）
routerApp.use(async (event, ctx, _, next) => {
  const socket = ctx.socket;
  // 放行所有数据流控制器
  if (event.startsWith("stream")) return next();
  // 除 auth 控制器是公开访问，其他业务控制器必须得到授权才可访问
  if (event === "auth") return await next();
  if (!ctx.session) throw new Error("Session does not exist in authentication middleware.");
  if (ctx.session.key === globalConfiguration.config.key && ctx.session.type === TOP_LEVEL && ctx.session.login && ctx.session.id) {
    return await next();
  }
  logger.warn($t("auth_router.notAccess", { id: socket.id, address: socket.handshake.address, event: event }));
  return protocol.error(ctx, "error", $t("auth_router.illegalAccess"));
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
    logger.info($t("auth_router.access", { id: ctx.socket.id, address: ctx.socket.handshake.address }));
    loginSuccessful(ctx, data);
    protocol.msg(ctx, "auth", true);
  } else {
    protocol.msg(ctx, "auth", false);
  }
});

// 已连接事件，用于超时身份认证关闭
routerApp.on("connection", (ctx) => {
  const session = ctx.session;
  setTimeout(() => {
    if (!session.login) {
      ctx.socket.disconnect();
      logger.info($t("auth_router.disconnect", { id: ctx.socket.id, address: ctx.socket.handshake.address }));
    }
  }, AUTH_TIMEOUT);
});

// 登录成功后必须执行此函数
function loginSuccessful(ctx: RouterContext, data: string) {
  ctx.session.key = data;
  ctx.session.login = true;
  ctx.session.id = ctx.socket.id;
  ctx.session.type = TOP_LEVEL;
  return ctx.session;
}
