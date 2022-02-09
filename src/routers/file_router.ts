/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
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
    const instance = InstanceSubsystem.getInstance(data.instanceUuid);
    if (instance.info.fileLock !== 0) {
      throw new Error("超出最大同时解压缩任务量，请等待其他解压缩任务完成后再执行。");
    }
    instance.info.fileLock = 1;
    if (type === 1) {
      // 异步执行
      fileManager
        .zip(source, targets)
        .then(() => {
          instance.info.fileLock = 0;
        })
        .catch((error) => {
          instance.info.fileLock = 0;
          protocol.responseError(ctx, error);
        });
    } else {
      // 异步执行
      fileManager
        .unzip(source, targets)
        .then(() => {
          instance.info.fileLock = 0;
        })
        .catch((error) => {
          instance.info.fileLock = 0;
          protocol.responseError(ctx, error);
        });
    }
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});
