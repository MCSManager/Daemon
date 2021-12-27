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
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
*/

import InstanceSubsystem from "../service/system_instance";
import FileManager from "./system_file";

export function getFileManager(instanceUuid: string) {
  // 针对实例初始化出一个文件管理器，并赋值编码，限制条件等
  const instance = InstanceSubsystem.getInstance(instanceUuid);
  if (!instance) throw new Error(`实例 ${instanceUuid} 不存在`);
  const fileCode = instance.config?.fileCode;
  const cwd = instance.config.cwd;
  return new FileManager(cwd, fileCode);
}
