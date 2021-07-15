/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 20:43:13
 * @LastEditTime: 2021-07-15 15:08:01
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import path from "path";
import fs from "fs-extra";

const ERROR_MSG_01 = "非法访问路径";

interface IFile {
  name: string;
  size: number;
  time: string;
  type: number;
}

export default class FileManager {
  public topPath: string = null;
  public cwd: string = ".";

  constructor(topPath: string = "") {
    if (!path.isAbsolute(topPath)) {
      this.topPath = path.normalize(path.join(process.cwd(), topPath));
    } else {
      this.topPath = path.normalize(topPath);
    }
  }

  toAbsolutePath(fileName: string = "") {
    return path.normalize(path.join(this.topPath, this.cwd, fileName));
  }

  checkPath(fileNameOrPath: string) {
    const destAbsolutePath = this.toAbsolutePath(fileNameOrPath);
    const topAbsolutePath = this.topPath;
    return destAbsolutePath.indexOf(topAbsolutePath) === 0;
  }

  check(destPath: string) {
    return this.checkPath(destPath) && fs.existsSync(this.toAbsolutePath(destPath));
  }

  cd(dirName: string) {
    if (!this.check(dirName)) throw new Error(ERROR_MSG_01);
    this.cwd = path.normalize(path.join(this.cwd, dirName));
  }

  list() {
    const fileNames = fs.readdirSync(this.toAbsolutePath());
    const files: IFile[] = [];
    const dirs: IFile[] = [];
    fileNames.forEach((name) => {
      const info = fs.statSync(this.toAbsolutePath(name));
      if (info.isFile()) {
        files.push({
          name: name,
          type: 1,
          size: info.size,
          time: info.atime.toString()
        });
      } else {
        dirs.push({
          name: name,
          type: 0,
          size: info.size,
          time: info.atime.toString()
        });

      }
    });
    files.sort((a, b) => a.name > b.name ? 1 : -1);
    dirs.sort((a, b) => a.name > b.name ? 1 : -1);
    const resultList = dirs.concat(files);
    return resultList;
  }

  async readFile(fileName: string) {
    if (!this.check(fileName)) throw new Error(ERROR_MSG_01);
    const absPath = this.toAbsolutePath(fileName);
    const text = await fs.readFile(absPath, { encoding: "utf-8" });
    return text;
  }

  async writeFile(fileName: string, data: string) {
    if (!this.check(fileName)) throw new Error(ERROR_MSG_01);
    const absPath = this.toAbsolutePath(fileName);
    await fs.writeFile(absPath, data, { encoding: "utf-8" });
  }

  async copy(fileName: string, destPath: string) {
    if (!this.checkPath(destPath) || !this.check(fileName)) throw new Error(ERROR_MSG_01);
  }
}
