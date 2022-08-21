// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import os from "os";
import fs from "fs-extra";
import https from "https";
import path from "path";
import logger from "./log";
const PTY_NAME = `pty_${os.platform()}_${os.arch()}${os.platform() === "win32" ? ".exe" : ""}`;
const PTY_PATH = path.normalize(path.join(process.cwd(), "lib", PTY_NAME));
const PTY_DIR_PATH = path.join(process.cwd(), "lib");

function installPtyForLinux(url: string) {
  return new Promise<number>((resolve, reject) => {
    if (!fs.existsSync(PTY_DIR_PATH)) fs.mkdirsSync(PTY_DIR_PATH);
    if (fs.existsSync(PTY_PATH) && fs.statSync(PTY_PATH)?.size > 1024) {
      logger.info($t("install.ptySupport"));
      return resolve(1);
    }
    const file = fs.createWriteStream(PTY_PATH);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error("code!=200"));
      }
      res.on("error", (err) => {
        if (fs.existsSync(PTY_PATH)) fs.removeSync(PTY_PATH);
        reject(err);
      });
      file
        .on("finish", () => {
          file.close();
          resolve(0);
        })
        .on("error", (err) => {
          reject(err);
        });

      res.pipe(file);
    });
  });
}

// Emulate terminal-dependent programs, PTY programs based on Go/C++
// Reference: https://github.com/MCSManager/pty
export function initDependent() {
  if (os.platform() !== "linux") return logger.info($t("install.skipInstall"));
  const ptyUrls = [`https://mcsmanager.com/download/${PTY_NAME}`, `https://mcsmanager.oss-cn-guangzhou.aliyuncs.com/${PTY_NAME}`];
  function setup(index = 0) {
    installPtyForLinux(ptyUrls[index])
      .then(() => {
        logger.info($t("install.installed"));
        logger.info($t("install.guide"));
        fs.chmod(PTY_PATH, 0o777, (err) => {
          if (err) logger.warn($t("install.changeModeErr", { path: PTY_PATH }));
        });
      })
      .catch((err) => {
        fs.remove(PTY_PATH, () => {});
        if (index === ptyUrls.length - 1) {
          logger.warn($t("install.installErr"));
          logger.warn(err);
          return;
        }
        return setup(index + 1);
      });
  }

  setup(0);
}
