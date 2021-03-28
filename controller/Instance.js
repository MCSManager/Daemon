/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例相关控制器
 */
const uuid = require("uuid");
const { routerApp } = require("../service/router");
const protocol = require("../service/protocol");
const { instanceService } = require("../service/instance_service");
const { Instance } = require("../entity/instance");
const { logger } = require("../service/log");

const { StartCommand } = require("../entity/commands/start");
const { StopCommand } = require("../entity/commands/stop");
const { SendCommand } = require("../entity/commands/cmd");
const { KillCommand } = require("../entity/commands/kill");
// const io = require('socket.io')();

// 部分实例操作路由器验证中间件
routerApp.use((event, socket, data, next) => {
  const instanceUUID = data.instanceUUID;
  if (event == "instance/new") return next();
  if (event == "instance/overview") return next();
  // 类 AOP
  if (event.startsWith("instance")) {
    if (!instanceService.exists(instanceUUID)) {
      return protocol.error(socket, event, {
        instanceUUID: instanceUUID,
        err: `应用实例 ${instanceUUID} 不存在，无法继续操作.`
      });
    }
  }
  next();
});


// 获取本守护进程实例总览
routerApp.on("instance/overview", (socket) => {
  const instances = instanceService.getAllInstance();
  const overview = [];
  for (const name in instances) {
    const instance = instanceService.getInstance(name);
    if (!instance) continue;
    overview.push({
      instanceUUID: instance.instanceUUID,
      createDatetime: instance.config.createDatetime,
      lastDatetime: instance.config.lastDatetime,
      startCount: instance.startCount,
      status: instance.status(),
    });
  }
  protocol.msg(socket, "instance/overview", overview);
});


// 新建应用实例
routerApp.on("instance/new", (socket, data) => {
  const nickname = data.nickname;
  const command = data.command;
  const cwd = data.cwd;
  const stopCommand = data.stopCommand || "^C";
  const newUUID = uuid.v4().replace(/-/igm, "");
  try {
    const instance = new Instance(newUUID);
    instance.parameters({
      nickname: nickname,
      startCommand: command,
      stopCommand: stopCommand,
      cwd: cwd,
      ie: "GBK",
      oe: "GBK"
    });
    instanceService.addInstance(instance);
    protocol.msg(socket, "instance/new", { instanceUUID: newUUID, nickname: nickname });
  } catch (err) {
    protocol.error(socket, "instance/new", { instanceUUID: newUUID, err: err.message });
  }
});


// 开启实例
routerApp.on("instance/open", (socket, data) => {
  const instanceUUID = data.instanceUUID;
  const instance = instanceService.getInstance(instanceUUID);
  try {
    instance.exec(new StartCommand(socket.id));
    protocol.msg(socket, "instance/open", { instanceUUID });
  } catch (err) {
    logger.error(`实例${instanceUUID}启动时错误: `, err);
    protocol.error(socket, "instance/open", { instanceUUID: instanceUUID, err: err.message });
  }
});


// 关闭实例
routerApp.on("instance/stop", (socket, data) => {
  const instanceUUID = data.instanceUUID;
  const instance = instanceService.getInstance(instanceUUID);
  try {
    instance.exec(new StopCommand());
    protocol.msg(socket, "instance/stop", { instanceUUID });
  } catch (err) {
    protocol.error(socket, "instance/stop", { instanceUUID: instanceUUID, err: err.message });
  }
});


// 删除实例
routerApp.on("instance/delete", (socket, data) => {
  const instanceUUID = data.instanceUUID;
  try {
    instanceService.removeInstance(instanceUUID);
    protocol.msg(socket, "instance/delete", { instanceUUID });
  } catch (err) {
    protocol.error(socket, "instance/delete", { instanceUUID: instanceUUID, err: err.message });
  }
});


// 向应用实例发送命令
routerApp.on("instance/command", (socket, data) => {
  const instanceUUID = data.instanceUUID;
  const command = data.command || "";
  const instance = instanceService.getInstance(instanceUUID);
  try {
    instance.exec(new SendCommand(command));
    protocol.msg(socket, "instance/command", { instanceUUID });
  } catch (err) {
    protocol.error(socket, "instance/command", { instanceUUID: instanceUUID, err: err.message });
  }
});


// 杀死应用实例方法
routerApp.on("instance/kill", (socket, data) => {
  const instanceUUID = data.instanceUUID;
  const instance = instanceService.getInstance(instanceUUID);
  try {
    instance.exec(new KillCommand());
    protocol.msg(socket, "instance/kill", { instanceUUID });
  } catch (err) {
    protocol.error(socket, "instance/kill", { instanceUUID: instanceUUID, err: err.message });
  }
});
