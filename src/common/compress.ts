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
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
*/

import fs from "fs-extra";

import * as compressing from "compressing";
import child_process from "child_process";

// 跨平台的高效率/低效率结合的解压缩方案

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
  // if (system === "win32") {
  //   await _7zipDecompress(zipPath, dest);
  // } else {

  // }
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
