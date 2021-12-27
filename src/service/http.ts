/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  

  版权所有 (C) 2021 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
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
    ctx.response.set("Access-Control-Allow-Headers", "Content-Type, Cookie, Accept-Encoding, User-Agent, Host, Referer, " + "X-Requested-With, Accept, Accept-Language, Cache-Control, Connection");
    ctx.response.set("X-Power-by", "MCSManager");
  });

  koaApp.use(koaRouter.routes()).use(koaRouter.allowedMethods());

  return koaApp;
}
