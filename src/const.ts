// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import os from "os";
import path from "path";

const ptyName = `pty_${os.platform()}_${os.arch()}${os.platform() === "win32" ? ".exe" : ""}`;

const PTY_PATH = path.normalize(path.join(process.cwd(), "lib", ptyName));

const FILENAME_BLACKLIST = ["\\", "/", ".", "'", '"', "?", "*", "<", ">"];


export { FILENAME_BLACKLIST, PTY_PATH };
