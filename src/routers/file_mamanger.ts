/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 22:44:06
 * @LastEditTime: 2021-06-26 22:47:12
 * @Description: 文件管理系统路由层
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import FileManager from "../service/system_file";
import InstanceSubsystem from "../service/system_instance";
import logger from "../service/log";

// 部分路由器操作路由器验证中间件
routerApp.use((event, ctx, data, next) => {
  if (event.startsWith("file")) {
    const instanceUuid = data.instanceUuid;
    if (!InstanceSubsystem.exists(instanceUuid)) {
      return protocol.error(ctx, event, {
        instanceUuid: instanceUuid,
        err: `The file operation failed, the instance ${instanceUuid} does not exist.`
      });
    }
  }
  next();
});

// 列出指定实例工作目录的文件列表
routerApp.on("file/list", (ctx, data) => {
  try {
    const fileManager = ctx.session.fileManager as FileManager;
    const overview = fileManager.list();
    protocol.response(ctx, overview);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 切换目录
routerApp.on("file/cd", (ctx, data) => {
  try {
    const cd = data.cd;
    const instance = InstanceSubsystem.getInstance(data.instanceUuid);
    const cwd = instance.config.cwd;
    ctx.session.fileManager = new FileManager(cwd);
    const fileManager = ctx.session.fileManager as FileManager;
    fileManager.cd(cd);
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});
