/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-08-02 19:54:21
 * @Description: 应用实例所有主动性事件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import RouterContext from "../entity/ctx";
import * as protocol from "../service/protocol";
import InstanceSubsystem from "../service/system_instance";

const TIME_SPEED = 100;
const MAX_CHAR_SIZE = 40;

// 定时发送程序输出流日志广播
// 此设计可以一次性打包多次内容，一并发送
const outputStreamCache: any = {};
setInterval(function () {
  for (const instanceUuid in outputStreamCache) {
    const text = outputStreamCache[instanceUuid];
    InstanceSubsystem.forEachForward(instanceUuid, (socket) => {
      protocol.msg(new RouterContext(null, socket), "instance/stdout", {
        instanceUuid: instanceUuid,
        text: text
      });
    });
    delete outputStreamCache[instanceUuid];
  }
}, TIME_SPEED);

// 实例输出流事件
// 默认加入到数据缓存中以控制发送速率确保其稳定性
InstanceSubsystem.on("data", (instanceUuid: string, text: string) => {
  if (outputStreamCache[instanceUuid]) {
    if (outputStreamCache[instanceUuid].length > 1000 * MAX_CHAR_SIZE) return (outputStreamCache[instanceUuid] += "\n[警告] 输出流数据过快，为保证稳定性，已屏蔽此刻更多内容....\n");
    outputStreamCache[instanceUuid] += text;
  } else {
    outputStreamCache[instanceUuid] = text;
  }
});

// 实例退出事件
InstanceSubsystem.on("exit", (obj: any) => {
  InstanceSubsystem.forEachForward(obj.instanceUuid, (socket) => {
    protocol.msg(new RouterContext(null, socket), "instance/stopped", {
      instanceUuid: obj.instanceUuid,
      instanceName: obj.instanceName
    });
  });
});

// 实例启动事件
InstanceSubsystem.on("open", (obj: any) => {
  InstanceSubsystem.forEachForward(obj.instanceUuid, (socket) => {
    protocol.msg(new RouterContext(null, socket), "instance/opened", {
      instanceUuid: obj.instanceUuid,
      instanceName: obj.instanceName
    });
  });
});

// 实例失败事件（一般用于启动失败，也可能是其他操作失败）
InstanceSubsystem.on("failure", (obj: any) => {
  InstanceSubsystem.forEachForward(obj.instanceUuid, (socket) => {
    protocol.msg(new RouterContext(null, socket), "instance/failure", {
      instanceUuid: obj.instanceUuid,
      instanceName: obj.instanceName
    });
  });
});
