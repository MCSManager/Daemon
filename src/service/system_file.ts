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

  list(page: 0, pageSize = 40) {
    if (pageSize > 100 || pageSize <= 0 || page < 0) throw new Error("Beyond the value limit");
    let fileNames = fs.readdirSync(this.toAbsolutePath());
    const total = fileNames.length;
    const sliceStart = page * pageSize;
    const sliceEnd = sliceStart + pageSize;
    fileNames = fileNames.slice(sliceStart, sliceEnd);
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
    return {
      items: resultList,
      page,
      pageSize,
      total
    };
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
    const blackKeys = ["/", "\\", "|", "?", "*", ">", "<", ";", '"'];
    for (const ch of blackKeys) {
      if (fileName.includes(ch)) return false;
    }
    return true;
  }
}
