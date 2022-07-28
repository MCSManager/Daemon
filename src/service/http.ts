/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import Koa from "koa";
import koaBody from "koa-body";

// 装载 HTTP 服务路由
import koaRouter from "../routers/http_router";

export function initKoa() {
  // 初始化 Koa 框架
  const koaApp = new Koa();
  koaApp.use(
    koaBody({
      multipart: true,
      formidable: {
        maxFileSize: 1024 * 1024 * 1024 * 1000
      }
    })
  );

  // 装载 Koa 最高级中间件
  koaApp.use(async (ctx, next) => {
    await next();
    // 因所有HTTP请求必须由面板端创建任务护照才可使用，因此准许跨域请求，也可保证安全
    ctx.response.set("Access-Control-Allow-Origin", "*");
    ctx.response.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    ctx.response.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Cookie, Accept-Encoding, User-Agent, Host, Referer, " +
        "X-Requested-With, Accept, Accept-Language, Cache-Control, Connection"
    );
    ctx.response.set("X-Power-by", "MCSManager");
  });

  koaApp.use(koaRouter.routes()).use(koaRouter.allowedMethods());

  return koaApp;
}
