/*
  Copyright (C) 2022 RimuruChan <RealSprite233@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  According to the AGPL, it is forbidden to delete all copyright notices,
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 RimuruChan <RealSprite233@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
*/

import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import { DockerProcessAdapter } from "./docker _start";

export interface IResizeOptions {
  h: number,
  w: number,
}

export default class DockerResizeCommand extends InstanceCommand {
  constructor() {
    super("ResizeTTY");
  }

  async exec(instance: Instance, size?: IResizeOptions): Promise<any> {
    // 关服命令需要发送命令，但关服命令执行前会设置状态为关闭中状态。
    // 所以这里只能通过进程是否存在来执行命令
    if (!instance.process) {
      instance.failure(new Error("命令执行失败，因为实例实际进程不存在."));
    }
    if (!(instance.process instanceof DockerProcessAdapter)) {
      instance.failure(new Error("重设TTY大小失败，因为实例不是Docker容器."));
    }
    let dockerProcess = <DockerProcessAdapter>instance.process;
    await dockerProcess.container.resize({
      h: size.h,
      w: size.w
    });
  }
}
