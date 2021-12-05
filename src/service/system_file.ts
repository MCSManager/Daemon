/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 20:43:13
 * @LastEditTime: 2021-08-25 15:24:38
 * @Projcet: MCSManager Daemon

 */

import path from "path";
import fs from "fs-extra";
import { compress, decompress } from "../common/compress";

const ERROR_MSG_01 = "非法访问路径";
const MAX_EDIT_SIZE = 1024 * 1024 * 4

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
    files.sort((a, b) => (a.name > b.name ? 1 : -1));
    dirs.sort((a, b) => (a.name > b.name ? 1 : -1));
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
    return await fs.writeFile(absPath, data, { encoding: "utf-8" });
  }

  async copy(target1: string, target2: string) {
    if (!this.checkPath(target2) || !this.check(target1)) throw new Error(ERROR_MSG_01);
    const targetPath = this.toAbsolutePath(target1);
    target2 = this.toAbsolutePath(target2);
    return await fs.copy(targetPath, target2);
  }

  mkdir(target: string) {
    if (!this.checkPath(target)) throw new Error(ERROR_MSG_01);
    const targetPath = this.toAbsolutePath(target);
    return fs.mkdirSync(targetPath);
  }

  async delete(target: string): Promise<boolean> {
    if (!this.check(target)) throw new Error(ERROR_MSG_01);
    const targetPath = this.toAbsolutePath(target);
    return new Promise((r, j) => {
      fs.remove(targetPath, (err) => {
        if (!err) r(true);
        else j(err);
      });
    });
  }

  async move(target: string, destPath: string) {
    if (!this.check(target)) throw new Error(ERROR_MSG_01);
    if (!this.checkPath(destPath)) throw new Error(ERROR_MSG_01);
    const targetPath = this.toAbsolutePath(target);
    destPath = this.toAbsolutePath(destPath);
    await fs.move(targetPath, destPath);
  }

  async unzip(sourceZip: string, destDir: string) {
    if (!this.check(sourceZip) || !this.checkPath(destDir)) throw new Error(ERROR_MSG_01);
    return await decompress(this.toAbsolutePath(sourceZip), this.toAbsolutePath(destDir));
  }

  async zip(sourceZip: string, files: string[]) {
    if (!this.checkPath(sourceZip)) throw new Error(ERROR_MSG_01);
    const sourceZipPath = this.toAbsolutePath(sourceZip);
    const filesPath = [];
    for (const iterator of files) {
      if (this.check(iterator)) filesPath.push(this.toAbsolutePath(iterator));
    }
    return await compress(sourceZipPath, filesPath);
  }

  async edit(target: string, data?: string) {
    if (!this.check(target)) throw new Error(ERROR_MSG_01);
    if (!data) {
      const absPath = this.toAbsolutePath(target);
      const info = fs.statSync(absPath);
      if (info.size > MAX_EDIT_SIZE) {
        throw new Error("超出最大文件编辑限制");
      }
      return await this.readFile(target);
    } else {
      return await this.writeFile(target, data);
    }
  }

  rename(target: string, newName: string) {
    if (!this.check(target)) throw new Error(ERROR_MSG_01);
    if (!this.checkPath(newName)) throw new Error(ERROR_MSG_01);
    const targetPath = this.toAbsolutePath(target);
    const newPath = this.toAbsolutePath(newName);
    fs.renameSync(targetPath, newPath);
  }

  public static checkFileName(fileName: string) {
    const blackKeys = ["/", "\\", "|", "?", "*", ">", "<", ";", '"', "'"];
    for (const ch of blackKeys) {
      if (fileName.includes(ch)) return false;
    }
    return true;
  }
}
