/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-08-28 15:00:21
 * @LastEditTime: 2021-09-03 14:43:58
 * @Description: 版本检查
 */

import * as fs from "fs-extra";
import GlobalVariable from "../common/global_variable";
import logger from './log';

const PACKAGE_JSON = "package.json";

export function initVersionManager() {
  try {
    GlobalVariable.set("version", "Unknown");
    if (fs.existsSync(PACKAGE_JSON)) {
      const data: any = JSON.parse(fs.readFileSync(PACKAGE_JSON, { encoding: "utf-8" }));
      if (data.version) {
        GlobalVariable.set("version", data.version);
      }
    }
  } catch (error) {
    logger.error("版本检查失败", error);
  }
}

export function getVersion() {
  return GlobalVariable.get("version", "Unknown");
}
