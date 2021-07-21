/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例相关控制器
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import InstanceSubsystem from "../service/system_instance";
import Instance from "../entity/instance/instance";
import logger from "../service/log";

import StartCommand from "../entity/commands/start";
import StopCommand from "../entity/commands/stop";
import SendCommand from "../entity/commands/cmd";
import KillCommand from "../entity/commands/kill";
import { IInstanceDetail } from "../service/interfaces";

// 部分实例操作路由器验证中间件
routerApp.use((event, ctx, data, next) => {
  if (event == "instance/new" && data) return next();
  if (event == "instance/overview") return next();
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
routerApp.on("instance/detail", (ctx, data) => {
  try {
    const instanceUuid = data.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    protocol.msg(ctx, "instance/detail", {
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info
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
    protocol.msg(ctx, "instance/new", { instanceUuid: newInstance.instanceUuid });
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
routerApp.on("instance/open", (ctx, data) => {
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    try {
      instance.exec(new StartCommand(ctx.socket.id));
      protocol.msg(ctx, "instance/open", { instanceUuid });
    } catch (err) {
      logger.error(`实例${instanceUuid}启动时错误: `, err);
      protocol.error(ctx, "instance/open", { instanceUuid: instanceUuid, err: err.message });
    }
  }
});

// 关闭实例
routerApp.on("instance/stop", (ctx, data) => {
  for (const instanceUuid of data.instanceUuids) {
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    try {
      instance.exec(new StopCommand());
      protocol.msg(ctx, "instance/stop", { instanceUuid });
      //Note: 去掉此回复会导致前端响应慢，可用考虑使用退出事件代替
    } catch (err) {
      protocol.error(ctx, "instance/stop", { instanceUuid: instanceUuid, err: err.message });
    }
  }
});

// 删除实例
routerApp.on("instance/delete", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  try {
    InstanceSubsystem.removeInstance(instanceUuid);
    protocol.msg(ctx, "instance/delete", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/delete", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 向应用实例发送命令
routerApp.on("instance/command", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const command = data.command || "";
  const instance = InstanceSubsystem.getInstance(instanceUuid);
  try {
    instance.exec(new SendCommand(command));
    protocol.msg(ctx, "instance/command", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/command", { instanceUuid: instanceUuid, err: err.message });
  }
});

// 向应用实例发送数据流
routerApp.on("instance/stdin", (ctx, data) => {
  // 本路由采用兼容性低且直接原始的方式来进行写数据
  // 因为此路由将会接收到每个字符
  const instance = InstanceSubsystem.getInstance(data.instanceUuid);
  try {
    if (data.ch == "\r") return instance.process.stdin.write("\n");
    instance.process.stdin.write(data.ch);
  } catch (err) {}
});

// 杀死应用实例方法
routerApp.on("instance/kill", (ctx, data) => {
  const instanceUuid = data.instanceUuid;
  const instance = InstanceSubsystem.getInstance(instanceUuid);
  try {
    instance.exec(new KillCommand());
    protocol.msg(ctx, "instance/kill", { instanceUuid });
  } catch (err) {
    protocol.error(ctx, "instance/kill", { instanceUuid: instanceUuid, err: err.message });
  }
});
