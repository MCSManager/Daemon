/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 22:44:06
 * @LastEditTime: 2021-08-01 18:55:27
 * @Description: 文件管理系统路由层
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import * as protocol from "../service/protocol";
import { routerApp } from "../service/router";
import { missionPassport } from "../service/mission_passport";
import InstanceSubsystem from "../service/system_instance";
import logger from "../service/log";
import SendCommand from "../entity/commands/cmd";
import ProcessInfo from "../entity/commands/process_info";
import ProcessInfoCommand from "../entity/commands/process_info";

// 权限认证中间件
routerApp.use((event, ctx, data, next) => {
  // 放行数据流身份验证路由
  if (event === "stream/auth") return next();
  // 检查数据流其他路由
  if (event.startsWith("stream")) {
    if (ctx.session.stream && ctx.session.stream.check === true) {
      return next();
    }
    return protocol.error(ctx, "error", "权限不足，非法访问");
  }
  next();
});

// 可公开访问数据流身份验证路由
routerApp.on("stream/auth", (ctx, data) => {
  try {
    const password = data.password;
    const mission = missionPassport.getMission(password, "stream_channel");
    if (!mission) throw new Error("任务不存在");

    // 实例UUID参数必须来自于任务参数，不可直接使用
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error("实例不存在");

    // 加入数据流认证标识
    logger.info(`会话 ${ctx.socket.id} ${ctx.socket.handshake.address} 数据流通道身份验证成功`);
    ctx.session.stream = {
      check: true,
      instanceUuid: instance.instanceUuid
    };

    // 开始向此 Socket 转发输出流数据
    InstanceSubsystem.forward(instance.instanceUuid, ctx.socket);
    logger.info(`会话 ${ctx.socket.id} ${ctx.socket.handshake.address} 已与 ${instance.instanceUuid} 建立数据通道`);

    // 注册断开时取消转发事件
    ctx.socket.on("disconnect", () => {
      InstanceSubsystem.stopForward(instance.instanceUuid, ctx.socket);
      logger.info(`会话 ${ctx.socket.id} ${ctx.socket.handshake.address} 已与 ${instance.instanceUuid} 断开数据通道`);
    });
    protocol.response(ctx, true);
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 获取实例详细信息
routerApp.on("stream/detail", async (ctx) => {
  try {
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    const processInfo = await instance.forceExec(new ProcessInfoCommand());
    protocol.response(ctx, {
      instanceUuid: instance.instanceUuid,
      started: instance.startCount,
      status: instance.status(),
      config: instance.config,
      info: instance.info,
      processInfo
    });
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});

// 执行命令
routerApp.on("stream/input", async (ctx, data) => {
  try {
    const command = data.command;
    const instanceUuid = ctx.session.stream.instanceUuid;
    const instance = InstanceSubsystem.getInstance(instanceUuid);
    await instance.exec(new SendCommand(command));
  } catch (error) {
    protocol.responseError(ctx, error);
  }
});
