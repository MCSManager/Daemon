// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import * as fs from "fs-extra";
import GlobalVariable from "../common/global_variable";
import logger from "./log";

const PACKAGE_JSON = "package.json";

export function initVersionManager() {
  try {
    const packagePaths = [PACKAGE_JSON, "../package.json"];
    let version = "Unknown";
    
    for (const packagePath of packagePaths) {
      if (fs.existsSync(packagePath)) {
        const data = JSON.parse(fs.readFileSync(packagePath, { encoding: "utf-8" }));
        if (data.version) {
          version = data.version;
          break;
        }
      }
    }
    
    GlobalVariable.set("version", version);
  } catch (error) {
    logger.error($t("version.versionDetectErr"), error);
  }
}

export function getVersion() {
  return GlobalVariable.get("version", "Unknown");
}
