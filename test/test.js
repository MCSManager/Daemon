/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-28 13:42:53
 * @LastEditTime: 2021-03-28 13:59:55
 * @Description: Test 基础文件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const io = require("socket.io-client");
require('should');

const connectConfig = {
  multiplex: false,
  reconnectionDelayMax: 1,
  timeout: 2000
};

const ip = "ws://127.0.0.1:24444";

module.exports.io = (config) => {
  const socket = io.connect(ip, connectConfig);
  socket.emit("auth", config.key);
  socket.on("auth", (msg) => {
    if (msg.status === 200 && msg.data === true) {
      config.on(socket);
      config.req(socket);
      return;
    }
    throw new Error(`身份认证失败`)
  });
}


module.exports.config = {
  connect: connectConfig,
  ip: ip
}