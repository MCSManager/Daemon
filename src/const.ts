/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import os from "os";
import path from "path";

const PTY_PATH = path.normalize(path.join(process.cwd(), "lib", os.platform() === "win32" ? "pty.exe" : "pty"));

const FILENAME_BLACKLIST = ["\\", "/", ".", "'", '"', "?", "*", "<", ">"];

// 常量表
export { FILENAME_BLACKLIST, PTY_PATH };
