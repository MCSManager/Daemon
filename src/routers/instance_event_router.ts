/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您必须保留所有版权声明，如果修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
*/

import path from "path";

import RouterContext from "../entity/ctx";
import * as protocol from "../service/protocol";
import InstanceSubsystem from "../service/system_instance";
import fs from "fs-extra";
const TIME_SPEED = 100;
const MAX_CHAR_SIZE = 40;

// 输出流记录到文本
async function outputLog(instanceUuid: string, text: string) {
  const logFilePath = path.join(InstanceSubsystem.LOG_DIR, `${instanceUuid}.log`);
  if (!fs.existsSync(InstanceSubsystem.LOG_DIR)) fs.mkdirsSync(InstanceSubsystem.LOG_DIR);
  try {
    const fileInfo = fs.statSync(logFilePath);
    if (fileInfo && fileInfo.size > 1024 * 1024 * 1) fs.removeSync(logFilePath);
  } catch (err) { }
  await fs.writeFile(logFilePath, text, { encoding: "utf-8", flag: "a" });
}

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
    if (outputStreamCache[instanceUuid].length > 1000 * MAX_CHAR_SIZE)
      return (outputStreamCache[instanceUuid] +=
        "\n[warning] the output data is too fast, more content has been blocked at this moment in order to ensure stability.\n[警告] 输出流数据过快，为保证稳定性，已屏蔽此刻更多内容....\n");
    outputStreamCache[instanceUuid] += text;
  } else {
    outputStreamCache[instanceUuid] = text;
  }
  // 输出内容追加到log文件
  outputLog(instanceUuid, text)
    .then(() => { })
    .catch(() => { });
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
