/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 应用实例所有主动性事件
 */

const protocol = require("../service/protocol");
const { instanceService } = require("../service/instance_service");

// 程序输出流日志广播
instanceService.on("data", (instanceName, text) => {
  protocol.broadcast("instance/stdout", {
    instanceName: instanceName,
    text: text
  });
});

// 实例退出事件
instanceService.on("exit", (instanceName) => {
  protocol.broadcast("instance/stopped", {
    instanceName: instanceName
  });
  // Note：现版本功能，每次退出都销毁实例，开启则重新新建
  instanceService.removeInstance(instanceName);
});

// 实例启动事件
instanceService.on("open", (instanceName) => {
  protocol.broadcast("instance/opened", {
    instanceName: instanceName
  });
});
