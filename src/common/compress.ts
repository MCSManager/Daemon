/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-08-25 14:30:14
 * @LastEditTime: 2021-12-25 20:58:22
 * @Description: 跨平台的高效率/低效率结合的解压缩方案
 * @Projcet: MCSManager Daemon
 */

import fs from "fs-extra";

import * as compressing from "compressing";
import child_process from "child_process";

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
