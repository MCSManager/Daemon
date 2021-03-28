/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 16:55:36
 * @Description: 日志
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const log4js = require("log4js");
const LOG_FILE_PATH = "logs/current.log";

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

function fullTime() {
  const date = new Date();
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
}

function fullLocalTime() {
  return new Date().toLocaleTimeString();
}

module.exports = {
  logger,
  fullTime,
  fullLocalTime
};
