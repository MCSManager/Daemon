/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您被禁止删除所有相关版权声明，若需修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
*/

import path from "path";
import fs from "fs-extra";
import { compress, decompress } from "../common/compress";
import os from "os";
import iconv from "iconv-lite";

const ERROR_MSG_01 = "非法访问路径";
const MAX_EDIT_SIZE = 1024 * 1024 * 4;

interface IFile {
  name: string;
  size: number;
  time: string;
  type: number;
}

export default class FileManager {
  public cwd: string = ".";

  constructor(public topPath: string = "", public fileCode?: string) {
    if (!path.isAbsolute(topPath)) {
      this.topPath = path.normalize(path.join(process.cwd(), topPath));
    } else {
      this.topPath = path.normalize(topPath);
    }
    if (!fileCode) {
      if (os.platform() === "win32") this.fileCode = "gbk";
      else this.fileCode = "utf-8";
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
    const buf = await fs.readFile(absPath);
    const text = iconv.decode(buf, this.fileCode);
    return text;
  }

  async writeFile(fileName: string, data: string) {
    if (!this.check(fileName)) throw new Error(ERROR_MSG_01);
    const absPath = this.toAbsolutePath(fileName);
    const buf = iconv.encode(data, this.fileCode);
    return await fs.writeFile(absPath, buf);
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
    return await decompress(this.toAbsolutePath(sourceZip), this.toAbsolutePath(destDir), this.fileCode);
  }

  async zip(sourceZip: string, files: string[]) {
    if (!this.checkPath(sourceZip)) throw new Error(ERROR_MSG_01);
    const sourceZipPath = this.toAbsolutePath(sourceZip);
    const filesPath = [];
    for (const iterator of files) {
      if (this.check(iterator)) filesPath.push(this.toAbsolutePath(iterator));
    }
    return await compress(sourceZipPath, filesPath, this.fileCode);
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
