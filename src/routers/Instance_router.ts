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

import fs from "fs-extra";
import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import Instance from "../entity/instance/instance";
import logger from "../service/log";
import path from "path";

import StartCommand from "../entity/commands/start";
import StopCommand from "../entity/commands/stop";
import SendCommand from "../entity/commands/cmd";
import KillCommand from "../entity/commands/kill";
import { IInstanceDetail } from "../service/interfaces";
import { QueryMapWrapper } from "../common/query_wrapper";
import ProcessInfoCommand from "../entity/commands/process_info";
import FileManager from "../service/system_file";
import { ProcessConfig } from "../entity/instance/process_config";
import RestartCommand from "../entity/commands/restart";

// 部分实例操作路由器验证中间件
routerApp.use((event, ctx, data, next) => {
  if (event == "instance/new" && data) return next();
  if (event == "instance/overview") return next();
  if (event == "instance/select") return next();
  // 类 AOP
  if (event.startsWith("instance")) {
    if (data.instanceUuids) return next();
    const instanceUuid = data.instanceUuid;
    if (!InstanceSubsystem.exists(instanceUuid)) {
      return protocol.error(ctx, event, {
        instanceUuid: instanceUuid,
        err: `The operation failed, the instance ${instanceUuid} does not exist.`
      });
    }
  }
  next();
});

// 获取本守护进程实例列表（查询式）
routerApp.on("instance/select", (ctx, data) => {
  const page = data.page || 1;
  const pageSize = data.pageSize || 1;
  const condition = data.condition;
  const overview: IInstanceDetail[] = [];
  // 关键字条件查询
  const queryWrapper = InstanceSubsystem.getQueryMapWrapper();
  let result = queryWrapper.select<Instance>((v) => {
    if (!v.config.nickname.includes(condition.instanceName)) return false;
    return true;
  });
  // 分页功能
  const pageResult = queryWrapper.page<Instance>(result, page, pageSize);
  // 过滤不需要的数据
  pageResult.data.forEach((instance) => {
    overview.push({
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info
    });
  });
  protocol.response(ctx, {
    page: pageResult.page,
    pageSize: pageResult.pageSize,
    maxPage: pageResult.maxPage,
    data: overview
  });
});

// 获取本守护进程实例总览
routerApp.on("instance/overview", (ctx) => {
  const overview: IInstanceDetail[] = [];
  InstanceSubsystem.instances.forEach((instance) => {
    overview.push({
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info
    });
  });

  protocol.msg(ctx, "instance/overview", overview);
});

// 获取本守护进程部分实例总览
routerApp.on("instance/section", (ctx, data) => {
  const instanceUuids = data.instanceUuids as string[];
  const overview: IInstanceDetail[] = [];
  InstanceSubsystem.instances.forEach((instance) => {
    instanceUuids.forEach((targetUuid) => {
      if (targetUuid === instance.instanceUuid) {
        overview.push({
          instanceUuid: instance.instanceUuid,
          started: instance.startCount,
          status: instance.status(),
          config: instance.config,
          info: instance.info
        });
      }
    });
  });
  protocol.msg(ctx, "instance/section", overview);
});

// 查看单个实例的详细情况
routerApp.on("instance/detail", async (ctx, data) => {
  try {
    const instanceUuid = data.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    let processInfo = null;
    let space = null;
    try {
      // 可能因文件权限导致错误的部分，避免影响整个配置的获取
      processInfo = await instance.forceExec(new ProcessInfoCommand());
      space = await instance.usedSpace(null, 2);
    } catch (err) {}
    protocol.msg(ctx, "instance/detail", {
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info,
      space,
      processInfo
    });
  } catch (err) {
    protocol.error(ctx, "instance/detail", { err: err.message });
  }
});

// 新建应用实例
routerApp.on("instance/new", (ctx, data) => {
  const config = data;
  try {
    const newInstance = InstanceSubsystem.createInstance(config);
    protocol.msg(ctx, "instance/new", { instanceUuid: newInstance.instanceUuid, config: newInstance.config });
  } catch (err) {
    protocol.error(ctx, "instance/new", { instanceUuid: null, err: err.message });
  }
});

// 更新实例数据
routerApp.on("instance/update", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const config = data.config;
  try {
    InstanceSubsystem.getInstance(instanceUuid).parameters(config);
    protocol.msg(ctx, "instance/update", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/update", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 请求转发某实例所有IO数据
routerApp.on("instance/forward", (ctx, data) => {
  const targetInstanceUuid = data.instanceUuid;
  const isforward: boolean = data.forward;
  try {
    // InstanceSubsystem.getInstance(targetInstanceUuid);
    if (isforward) {
      logger.info(`会话 ${ctx.socket.id} 请求转发实例 ${targetInstanceUuid} IO 流`);
      InstanceSubsystem.forward(targetInstanceUuid, ctx.socket);
    } else {
      logger.info(`会话 ${ctx.socket.id} 请求取消转发实例 ${targetInstanceUuid} IO 流`);
      InstanceSubsystem.stopForward(targetInstanceUuid, ctx.socket);
    }
    protocol.msg(ctx, "instance/forward", { instanceUuid: targetInstanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/forward", { instanceUuid: targetInstanceUuid, err: err.message });
  }
});

// 开启实例
routerApp.on("instance/open", async (ctx, data) => {
  const disableResponse = data.disableResponse;
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    try {
      await instance.exec(new StartCommand(ctx.socket.id));
      if (!disableResponse) protocol.msg(ctx, "instance/open", { instanceUuid });
    } catch (err) {
      if (!disableResponse) {
        logger.error(`实例${instanceUuid}启动时错误: `, err);
        protocol.error(ctx, "instance/open", { instanceUuid: instanceUuid, err: err.message });
      }
    }
  }
});

// 关闭实例
routerApp.on("instance/stop", async (ctx, data) => {
  const disableResponse = data.disableResponse;
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    try {
      await instance.exec(new StopCommand());
      //Note: 去掉此回复会导致前端响应慢，因为前端会等待面板端消息转发
      if (!disableResponse) protocol.msg(ctx, "instance/stop", { instanceUuid });
    } catch (err) {
      if (!disableResponse) protocol.error(ctx, "instance/stop", { instanceUuid: instanceUuid, err: err.message });
    }
  }
});

// 重启实例
routerApp.on("instance/restart", async (ctx, data) => {
  const disableResponse = data.disableResponse;
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    try {
      await instance.exec(new RestartCommand());
      if (!disableResponse) protocol.msg(ctx, "instance/restart", { instanceUuid });
    } catch (err) {
      if (!disableResponse) protocol.error(ctx, "instance/restart", { instanceUuid: instanceUuid, err: err.message });
    }
  }
});

// 终止实例方法
routerApp.on("instance/kill", async (ctx, data) => {
  const disableResponse = data.disableResponse;
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    if (!instance) continue;
    try {
      await instance.forceExec(new KillCommand());
      if (!disableResponse) protocol.msg(ctx, "instance/kill", { instanceUuid });
    } catch (err) {
      if (!disableResponse) protocol.error(ctx, "instance/kill", { instanceUuid: instanceUuid, err: err.message });
    }
  }
});

// 向应用实例发送命令
routerApp.on("instance/command", async (ctx, data) => {
  const disableResponse = data.disableResponse;
  const instanceUuid = data.instanceUuid;
  const command = data.command || "";
  const instance = InstanceSubsystem.getInstance(instanceUuid);
  try {
    await instance.exec(new SendCommand(command));
    if (!disableResponse) protocol.msg(ctx, "instance/command", { instanceUuid });
  } catch (err) {
    if (!disableResponse) protocol.error(ctx, "instance/command", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 删除实例
routerApp.on("instance/delete", (ctx, data) => {
  const instanceUuids = data.instanceUuids;
  const deleteFile = data.deleteFile;
  for (const instanceUuid of instanceUuids) {
    try {
      InstanceSubsystem.removeInstance(instanceUuid, deleteFile);
    } catch (err) {}
  }
  protocol.msg(ctx, "instance/delete", instanceUuids);
});

// 向应用实例发送数据流
routerApp.on("instance/stdin", (ctx, data) => {
  // 本路由采用兼容性低且直接原始的方式来进行写数据
  // 因为此路由将会接收到每个字符
  const instance = InstanceSubsystem.getInstance(data.instanceUuid);
  try {
    if (data.ch == "\r") return instance.process.write("\n");
    instance.process.write(data.ch);
  } catch (err) {}
});

routerApp.on("instance/process_config/list", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const files = data.files;
  const result: any[] = [];
  try {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    const fileManager = new FileManager(instance.absoluteCwdPath());
    for (const filePath of files) {
      if (fileManager.check(filePath)) {
        result.push({
          file: filePath,
          check: true
        });
      }
    }
    protocol.response(ctx, result);
  } catch (err) {
    protocol.responseError(ctx, err);
  }
});

// 获取或更新实例指定文件的内容
routerApp.on("instance/process_config/file", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const fileName = data.fileName;
  const config = data.config || null;
  const fileType = data.type;
  try {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    const fileManager = new FileManager(instance.absoluteCwdPath());
    if (!fileManager.check(fileName)) throw new Error("文件不存在或路径错误，文件访问被拒绝");
    const filePath = path.normalize(path.join(instance.absoluteCwdPath(), fileName));
    const processConfig = new ProcessConfig({
      fileName: fileName,
      redirect: fileName,
      path: filePath,
      type: fileType,
      info: null,
      fromLink: null
    });
    if (config) {
      processConfig.write(config);
      return protocol.response(ctx, true);
    } else {
      const json = processConfig.read();
      return protocol.response(ctx, json);
    }
  } catch (err) {
    protocol.responseError(ctx, err);
  }
});

// 获取实例终端日志
routerApp.on("instance/outputlog", async (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  try {
    const filePath = path.join(InstanceSubsystem.LOG_DIR, `${instanceUuid}.log`);
    if (fs.existsSync(filePath)) {
      const text = await fs.readFile(filePath, { encoding: "utf-8" });
      return protocol.response(ctx, text);
    }
    protocol.responseError(ctx, new Error("终端日志文件不存在"));
  } catch (err) {
    protocol.responseError(ctx, err);
  }
});
