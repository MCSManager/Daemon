/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-07-02 19:38:02
 * @Description: 应用实例所有主动性事件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import RouterContext from "../entity/ctx";
import * as protocol from "../service/protocol";
import InstanceSubsystem from "../service/system_instance";



// 程序输出流日志广播
InstanceSubsystem.on("data", (instanceUuid: string, text: string) => {
  InstanceSubsystem.forEachForward(instanceUuid, (socket) => {
    protocol.msg(new RouterContext(null, socket), "instance/stdout", {
      instanceUuid: instanceUuid,
      text: text
    });
  });
});

// 实例退出事件
InstanceSubsystem.on("exit", (obj: any) => {
  protocol.broadcast("instance/stopped", {
    instanceUuid: obj.instanceUuid,
    instanceName: obj.instanceName
  });
});

// 实例启动事件
InstanceSubsystem.on("open", (obj: any) => {
  protocol.broadcast("instance/opened", {
    instanceUuid: obj.instanceUuid,
    instanceName: obj.instanceName
  });
});


// 实例失败事件（一般用于启动失败，也可能是其他操作失败）
InstanceSubsystem.on("failure", (obj: any) => {
  protocol.broadcast("instance/failure", {
    instanceUuid: obj.instanceUuid,
    instanceName: obj.instanceName
  });
});

