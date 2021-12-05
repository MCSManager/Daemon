/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 22:44:06
 * @LastEditTime: 2021-08-29 20:06:02
 * @Description: 文件管理系统路由层
 * @Projcet: MCSManager Daemon
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import { getFileManager } from "../service/file_router_service";

// 部分路由器操作路由器验证中间件
routerApp.use((event, ctx, data, next) => {
  if (event.startsWith("file/")) {
    const instanceUuid = data.instanceUuid;
    if (!InstanceSubsystem.exists(instanceUuid)) {
      return protocol.error(ctx, event, {
        instanceUuid: instanceUuid,
        err: `实例 ${instanceUuid} 不存在`
      });
    }
  }
  next();
});

// 列出指定实例工作目录的文件列表
routerApp.on("file/list", (ctx, data) => {
  try {
    const fileManager = getFileManager(data.instanceUuid);
    fileManager.cd(data.target);
    const overview = fileManager.list();
    protocol.response(ctx, overview);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 创建目录
routerApp.on("file/mkdir", (ctx, data) => {
  try {
    const target = data.target;
    const fileManager = getFileManager(data.instanceUuid);
    fileManager.mkdir(target);
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 复制文件
routerApp.on("file/copy", async (ctx, data) => {
  try {
    // [["a.txt","b.txt"],["cxz","zzz"]]
    const targets = data.targets;
    const fileManager = getFileManager(data.instanceUuid);
    for (const target of targets) {
      fileManager.copy(target[0], target[1]);
    }
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 移动文件
routerApp.on("file/move", async (ctx, data) => {
  try {
    // [["a.txt","b.txt"],["cxz","zzz"]]
    const targets = data.targets;
    const fileManager = getFileManager(data.instanceUuid);
    for (const target of targets) {
      await fileManager.move(target[0], target[1]);
    }
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 删除文件
routerApp.on("file/delete", async (ctx, data) => {
  try {
    const targets = data.targets;
    const fileManager = getFileManager(data.instanceUuid);
    for (const target of targets) {
      // 异步删除
      fileManager.delete(target);
    }
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 编辑文件
routerApp.on("file/edit", async (ctx, data) => {
  try {
    const target = data.target;
    const text = data.text;
    const fileManager = getFileManager(data.instanceUuid);
    const result = await fileManager.edit(target, text);
    protocol.response(ctx, result ? result : true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 压缩/解压文件
routerApp.on("file/compress", async (ctx, data) => {
  try {
    const source = data.source;
    const targets = data.targets;
    const type = data.type;
    const fileManager = getFileManager(data.instanceUuid);
    if (type === 1) {
      // 异步执行
      fileManager
        .zip(source, targets)
        .then(() => {})
        .catch((error) => {
          protocol.responseError(ctx, error);
        });
    } else {
      // 异步执行
      fileManager
        .unzip(source, targets)
        .then(() => {})
        .catch((error) => {
          protocol.responseError(ctx, error);
        });
    }
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});
