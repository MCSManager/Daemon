/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-08-24 19:34:48
 * @LastEditTime: 2021-08-24 20:12:02
 * @Description:
 * @Projcet: MCSManager Daemon
 */

import child_process from "child_process";

function zipFiles(zipName: string, files: string[]) {
  const cmd = `7z.exe a ${zipName} ${files.join(" ")}`.split(" ");
  console.log(`[7zip 压缩任务] ${cmd}`);
  return new Promise((resolve, reject) => {
    const p = cmd.splice(1);
    const process = child_process.spawn(cmd[0], [...p], {
      cwd: "../7zip/"
    });
    if (!process || !process.pid) return reject(false);
    process.on("exit", (code) => {
      if (code) return reject(false);
      return resolve(true);
    });
  });
}

async function unzipArchive(sourceZip: string, destDir: string) {
  // ./7z.exe x archive.zip -oD:\7-Zip
  const cmd = `7z.exe x ${sourceZip} -o${destDir}`.split(" ");
  console.log(`[7zip 解压任务] ${cmd.join(" ")}`);
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(cmd[0], [cmd[1], cmd[2], cmd[3]], {
      cwd: "../7zip/"
    });
    if (!process || !process.pid) return reject(false);
    process.on("exit", (code) => {
      if (code) return reject(false);
      return resolve(true);
    });
  });
}

async function main() {
  await zipFiles("a.zip", ["D:/MineSuwings/Project2104-Daemon/test_file"]);
  await unzipArchive("a.zip", "D:/MineSuwings/Project2104-Daemon/test_file/a");
}

main();
