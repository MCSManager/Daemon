/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-26 11:23:23
 * @LastEditTime: 2021-07-26 11:27:24
 * @Description:
 * @Projcet: MCSManager Daemon

 */
import InstanceSubsystem from "../service/system_instance";
import FileManager from "./system_file";

export function getFileManager(instanceUuid: string) {
  const instance = InstanceSubsystem.getInstance(instanceUuid);
  if (!instance) throw new Error(`实例 ${instanceUuid} 不存在`);
  const cwd = instance.config.cwd;
  return new FileManager(cwd);
}
