// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import { missionPassport } from "../service/mission_passport";
import InstanceSubsystem from "../service/system_instance";
import logger from "../service/log";
import SendCommand from "../entity/commands/cmd";
import SendInput from "../entity/commands/input";

// 权限认证中间件
routerApp.use(async (event, ctx, data, next) => {
  // 放行数据流身份验证路由
  if (event === "stream/auth") return next();
  // 检查数据流其他路由
  if (event.startsWith("stream")) {
    if (ctx.session.stream && ctx.session.stream.check === true && ctx.session.type === "STREAM") {
      return await next();
    }
    return protocol.error(ctx, "error", $t("stream_router.unauthorizedAccess"));
  }
  return await next();
});

// 可公开访问数据流身份验证路由
routerApp.on("stream/auth", (ctx, data) => {
  try {
    const password = data.password;
    const mission = missionPassport.getMission(password, "stream_channel");
    if (!mission) throw new Error($t("stream_router.taskNotExist"));

    // 实例UUID参数必须来自于任务参数，不可直接使用
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error($t("stream_router.instanceNotExist"));

    // 加入数据流认证标识
    logger.info($t("stream_router.authSuccess", { id: ctx.socket.id, address: ctx.socket.handshake.address }));
    ctx.session.id = ctx.socket.id;
    ctx.session.login = true;
    ctx.session.type = "STREAM";
    ctx.session.stream = {
      check: true,
      instanceUuid: instance.instanceUuid
    };

    // 开始向此 Socket 转发输出流数据
    InstanceSubsystem.forward(instance.instanceUuid, ctx.socket);
    logger.info(
      $t("stream_router.establishConnection", { id: ctx.socket.id, address: ctx.socket.handshake.address, uuid: instance.instanceUuid })
    );

    // 注册断开时取消转发事件
    ctx.socket.on("disconnect", () => {
      InstanceSubsystem.stopForward(instance.instanceUuid, ctx.socket);
      logger.info(
        $t("stream_router.disconnect", { id: ctx.socket.id, address: ctx.socket.handshake.address, uuid: instance.instanceUuid })
      );
    });
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error, {
      notPrintErr: true
    });
  }
});

// 获取实例详细信息
routerApp.on("stream/detail", async (ctx) => {
  try {
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    // const processInfo = await instance.forceExec(new ProcessInfoCommand());
    protocol.response(ctx, {
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info
      // processInfo
    });
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 执行命令，适用于普通进程的行式交互输入输出流
routerApp.on("stream/input", async (ctx, data) => {
  try {
    const command = data.command;
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    await instance.exec(new SendCommand(command));
  } catch (error) {
    // 忽略此处潜在的高频异常
    // protocol.responseError(ctx, error);
  }
});

// 处理终端输入，适用于仿真终端的直连输入输出流。
routerApp.on("stream/write", async (ctx, data) => {
  try {
    const buf = data.input;
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    // 不采用命令执行方式运行
    if (instance.process) instance.process.write(buf);
  } catch (error) {
    // 忽略此处潜在的高频异常
    // protocol.responseError(ctx, error);
  }
});

// 处理终端 resize
routerApp.on("stream/resize", async (ctx, data) => {
  try {
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    if (instance.config.processType === "docker") await instance.execPreset("resize", data);
  } catch (error) {
    // protocol.responseError(ctx, error);
  }
});
