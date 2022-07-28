/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
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
