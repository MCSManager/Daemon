// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import * as fs from "fs-extra";
import GlobalVariable from "../common/global_variable";
import logger from "./log";

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
