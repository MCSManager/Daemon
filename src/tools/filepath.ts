/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-15 16:55:07
 * @LastEditTime: 2021-07-15 16:57:17
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

export function checkFileName(fileName: string) {
  const blackKeys = ["/", "\\", "|", "?", "*", ">", "<", ";", '"', "'"];
  for (const ch of blackKeys) {
    if (fileName.includes(ch)) return false;
  }
  return true;
}
