// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import os from "os";
import fs from "fs-extra";
import https from "https";
import path from "path";
import logger from "./log";
const PTY_PATH = path.normalize(path.join(process.cwd(), "lib", "pty"));
const PTY_DIR_PATH = path.join(process.cwd(), "lib");

function installPtyForLinux(url: string) {
  return new Promise<number>((resolve, reject) => {
    if (os.arch() !== "x64") {
      if (!fs.existsSync(PTY_PATH)) logger.info("仿真终端只能支持 Windows/Linux x86_64 架构，已自动降级为普通终端");
      resolve(-1);
    }
    if (!fs.existsSync(PTY_DIR_PATH)) fs.mkdirsSync(PTY_DIR_PATH);
    if (fs.existsSync(PTY_PATH) && fs.statSync(PTY_PATH)?.size > 1024) {
      logger.info("识别到可选依赖库安装，仿真终端功能已可用");
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

// 仿真终端依赖程序，基于 Go/C++ 实现的 PTY 程序
// 参考：https://github.com/MCSManager/pty
export function initDependent() {
  if (os.platform() !== "linux") return logger.info("检测到系统不是 Linux 系统，自动跳过依赖库安装");
  const ptyUrls = ["https://mcsmanager.com/download/pty_linux", "https://mcsmanager.oss-cn-guangzhou.aliyuncs.com/pty_linux"];
  function setup(index = 0) {
    installPtyForLinux(ptyUrls[index])
      .then(() => {
        logger.info("可选依赖程序已自动安装，仿真终端和部分高级功能已自动启用");
        logger.info("依赖程序参考：https://github.com/mcsmanager/pty");
        fs.chmod(PTY_PATH, 0o777, (err) => {
          if (err) logger.warn(`修改文件 ${PTY_PATH} 权限失败，请手动设置其为 chmod 755 以上`);
        });
      })
      .catch((err) => {
        fs.remove(PTY_PATH, () => {});
        if (index === ptyUrls.length - 1) {
          logger.warn(`安装可选依赖库失败，全仿真终端和部分可选功能将无法使用，不影响正常功能，将在下次启动时再尝试安装`);
          logger.warn(err);
          return;
        }
        return setup(index + 1);
      });
  }

  setup(0);
}
