/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-08-24 20:05:46
 * @LastEditTime: 2021-08-24 20:10:03
 * @Description:
 * @Projcet: MCSManager Daemon
 */
const zlib = require("zlib");
const fs = require("fs");
// const Buffer = zlib.unzipSync(fs.readFileSync("abc.zip"));

let gzip = zlib.createGunzip();

let inFile = fs.createReadStream("./a.zip");
let out = fs.createWriteStream("./2.txt");

inFile.pipe(gzip).pipe(out);
