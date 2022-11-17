// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import fs from "fs-extra";
import * as log4js from "log4js";
import os from "os";
import { systemInfo } from "../common/system_info";
import { $t } from "../i18n";

const LOG_FILE_PATH = "logs/current.log";

// save the log file separately on each startup
if (fs.existsSync(LOG_FILE_PATH)) {
  const time = new Date();
  const timeString = `${time.getFullYear()}-${
    time.getMonth() + 1
  }-${time.getDate()}_${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
  fs.renameSync(LOG_FILE_PATH, `logs/${timeString}.log`);
}

log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "[%d{MM/dd hh:mm:ss}] [%[%p%]] %m"
      }
    },
    app: {
      type: "file",
      filename: LOG_FILE_PATH,
      layout: {
        type: "pattern",
        pattern: "%d %p %m"
      }
    }
  },
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "info"
    }
  }
});

const logger = log4js.getLogger("default");

function toInt(v: number) {
  return parseInt(String(v));
}

function systemInfoReport() {
  const MB_SIZE = 1024 * 1024;
  const info = systemInfo();

  const self = process.memoryUsage();
  const sysInfo =
    `MEM: ${toInt((info.totalmem - info.freemem) / MB_SIZE)}MB/${toInt(info.totalmem / MB_SIZE)}MB` + ` CPU: ${toInt(info.cpuUsage * 100)}%`;
  const selfInfo = `Heap: ${toInt(self.heapUsed / MB_SIZE)}MB/${toInt(self.heapTotal / MB_SIZE)}MB`;
  const selfInfo2 = `RSS: ${toInt(self.rss / MB_SIZE)}MB External: ${toInt(self.external / MB_SIZE)}MB `;
  const logTip = $t("app.sysinfo");
  logger.info([`[${logTip}]`, sysInfo].join(" "));
  logger.info([`[${logTip}]`, selfInfo, selfInfo2].join(" "));
}

setInterval(systemInfoReport, 1000 * 15);

export default logger;
