/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例相关控制器
 */

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
  const instanceName = data.instanceName;
  // const instance = instanceService.getInstance(instanceName);
  if (event == "instance/open" || event == "instance/stop" || event == "instance/command" || event == "instance/kill") {
    if (!instanceService.exists(instanceName)) {
      protocol.sendError(socket, event, {
        instanceName: instanceName,
        err: `应用实例 ${instanceName} 不存在或未运行，无法继续操作`
      });
      return;
    }
  }
  if (event == "instance/open") {
    if (instanceService.getInstance(instanceName).status() != Instance.STATUS_STOP) {
      protocol.sendError(socket, event, {
        instanceName: instanceName,
        err: `应用实例 ${instanceName} 已经在运行`
      });
      return;
    }
  }
  next();
});


// 获取实例列表
routerApp.on("instance/overview", (socket) => {
  const instances = instanceService.getAllInstance();
  const overview = [];
  for (const name in instances) {
    const instance = instanceService.getInstance(name);
    if (!instance) continue;
    overview.push({
      instanceName: instance.instanceName,
      status: instance.status()
    });
  }
  protocol.send(socket, "instance/overview", overview);
});


// 新建应用实例
routerApp.on("instance/new", (socket, data) => {
  const instanceName = data.instanceName;
  const command = data.command;
  const cwd = data.cwd;
  const stopCommand = data.stopCommand || "^C";
  try {
    const instance = new Instance(instanceName);
    instance.parameters({
      startCommand: command,
      stopCommand: stopCommand,
      cwd: cwd,
      ie: "GBK",
      oe: "GBK"
    });
    instanceService.createInstance(instance);
    protocol.send(socket, "instance/new", { instanceName });
  } catch (err) {
    protocol.sendError(socket, "instance/new", {
      instanceName: instanceName,
      err: err.message
    });
  }
});


// 开启实例
routerApp.on("instance/open", (socket, data) => {
  const instanceName = data.instanceName;
  const instance = instanceService.getInstance(instanceName);
  try {
    instance.exec(new StartCommand());
    protocol.send(socket, "instance/open", { instanceName });
  } catch (err) {
    logger.warn(`应用实例${instanceName}启动时错误: ${err}`);
    protocol.sendError(socket, "instance/open", {
      instanceName: instanceName,
      err: err.message
    });
  }
});


// 关闭实例
routerApp.on("instance/stop", (socket, data) => {
  const instanceName = data.instanceName;
  const instance = instanceService.getInstance(instanceName);
  try {
    instance.exec(new StopCommand());
    protocol.send(socket, "instance/stop", { instanceName });
  } catch (err) {
    protocol.sendError(socket, "instance/stop", {
      instanceName: instanceName,
      err: err.message
    });
  }
});


// 删除实例
routerApp.on("instance/delete", (socket, data) => {
  const instanceName = data.instanceName;
  try {
    instanceService.removeInstance(instanceName);
    protocol.send(socket, "instance/delete", { instanceName });
  } catch (err) {
    protocol.error(socket, "instance/delete", { instanceName: instanceName, err: err.message });
  }
});


// 向应用实例发送命令
routerApp.on("instance/command", (socket, data) => {
  const instanceName = data.instanceName;
  const command = data.command || "";
  const instance = instanceService.getInstance(instanceName);
  try {
    instance.exec(new SendCommand(command));
    protocol.send(socket, "instance/command", { instanceName });
  } catch (err) {
    protocol.sendError(socket, "instance/command", {
      instanceName: instanceName,
      err: err.message
    });
  }
});


// 杀死应用实例方法
routerApp.on("instance/kill", (socket, data) => {
  const instanceName = data.instanceName;
  const instance = instanceService.getInstance(instanceName);
  try {
    instance.exec(new KillCommand());
    protocol.send(socket, "instance/kill", { instanceName });
  } catch (err) {
    protocol.sendError(socket, "instance/kill", {
      instanceName: instanceName,
      err: err.message
    });
  }
});
