/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
*/

import os from "os";
import fs from "fs-extra";
import https from "https";
import path from "path";
import logger from "./log";
import { Logger } from "log4js";

const PTY_PATH = path.normalize(path.join(process.cwd(), "lib", "pty"));
const PTY_DIR_PATH = path.join(process.cwd(), "lib");

function installPtyForLinux(url: string) {
  return new Promise<number>((resolve, reject) => {
    // if (os.platform() !== "linux") resolve(-1);

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

// 自动安装依赖库
// 依赖程序基于 Go 语言开发，开源地址：https://github.com/MCSManager/pty
export function initDependent() {
  const ptyUrls = ["https://mcsmanager.com/download/pty_linux", "https://mcsmanager.oss-cn-guangzhou.aliyuncs.com/pty_linux"];
  function setup(index = 0) {
    installPtyForLinux(ptyUrls[index])
      .then(() => {
        logger.info("可选依赖程序已自动安装，仿真终端和部分高级功能已自动启用");
        logger.info("依赖程序参考：https://github.com/mcsmanager/pty");
        fs.chmod(PTY_PATH, 0o777, () => {
          logger.warn(`修改文件 ${PTY_PATH} 权限失败，请手动设置其为 chmod 755 以上`);
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
