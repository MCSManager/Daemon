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

import fs from "fs-extra";
import path from "path";
import * as compressing from "compressing";
import child_process from "child_process";
import os from "os";

// 跨平台的高效率/低效率结合的解压缩方案
const system = os.platform();

function checkFileName(fileName: string) {
  const disableList = ['"', "/", "\\", "?", "|"];
  for (const iterator of disableList) {
    if (fileName.includes(iterator)) return false;
  }
  return true;
}

async function nodeCompress(zipPath: string, files: string[], fileCode: string = "utf-8") {
  const stream = new compressing.zip.Stream();
  files.forEach((v) => {
    stream.addEntry(v, {});
  });
  const destStream = fs.createWriteStream(zipPath);
  stream.pipe(destStream);
}

async function nodeDecompress(sourceZip: string, destDir: string, fileCode: string = "utf-8") {
  return await compressing.zip.uncompress(sourceZip, destDir, {
    zipFileNameEncoding: fileCode
  });
}

export async function compress(sourceZip: string, files: string[], fileCode?: string) {
  // TODO 与系统集成的解压缩功能
  // if (system === "win32") {
  //   await _7zipCompress(sourceZip, files);
  // } else {

  // }
  return await nodeCompress(sourceZip, files, fileCode);
}

export async function decompress(zipPath: string, dest: string, fileCode?: string) {
  if (system === "linux") {
    if (haveLinuxUnzip()) {
      console.log("xxxxxxxxxxxxxxxxxx");
      return await linuxUnzip(zipPath, dest);
    }
  }
  return await nodeDecompress(zipPath, dest, fileCode);
}

async function _7zipCompress(zipPath: string, files: string[]) {
  const cmd = `7z.exe a ${zipPath} ${files.join(" ")}`.split(" ");
  console.log(`[7zip 压缩任务] ${cmd.join(" ")}`);
  return new Promise((resolve, reject) => {
    const p = cmd.splice(1);
    const process = child_process.spawn(cmd[0], [...p], {
      cwd: "./7zip/"
    });
    if (!process || !process.pid) return reject(false);
    process.on("exit", (code) => {
      if (code) return reject(false);
      return resolve(true);
    });
  });
}

async function _7zipDecompress(sourceZip: string, destDir: string) {
  // ./7z.exe x archive.zip -oD:\7-Zip
  const cmd = `7z.exe x ${sourceZip} -o${destDir}`.split(" ");
  console.log(`[7zip 解压任务] ${cmd.join(" ")}`);
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(cmd[0], [cmd[1], cmd[2], cmd[3]], {
      cwd: "./7zip/"
    });
    if (!process || !process.pid) return reject(false);
    process.on("exit", (code) => {
      if (code) return reject(false);
      return resolve(true);
    });
  });
}

function haveLinuxUnzip() {
  const result = child_process.execSync("unzip -hh");
  return result?.toString("utf-8").toLowerCase().includes("extended help for unzip");
}

async function linuxUnzip(sourceZip: string, destDir: string) {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn("unzip", [sourceZip, "-d", destDir], {
      cwd: path.normalize(path.dirname(sourceZip))
    });
    if (!process || !process.pid) return reject(false);
    process.on("exit", (code) => {
      if (code) return reject(false);
      return resolve(true);
    });
  });
}
