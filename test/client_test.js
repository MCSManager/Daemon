/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2020-11-23 17:54:07
 * @Description: Socket 基本通信与基本功能测试类
 */

const io = require("socket.io-client");
const protocol = require("../service/protocol");

const socket = io.connect("ws://127.0.0.1:24444", {
  multiplex: false,
  reconnectionDelayMax: 1000,
  timeout: 1000,
  query: {
    token: "test"
  }
});

socket.on("disconnect", (err) => {
  console.log("链接断开:", err);
});

socket.on("connect_error", function (err) {
  console.log("链接错误:", err);
});

socket.on("error", function (err) {
  console.log(`错误: ${err}`);
});
socket.on("reconnect_attempt", function (count) {
  console.log(`第 ${count} 次重连尝试中...`);
});

socket.on("protocol", (msg) => {
  console.log("客户端收到: ", msg);
});

socket.on("log", (msg) => {
  console.log("客户端日志: ", protocol.parse(msg));
});

// 身份验证 测试密匙test_key
protocol.send(socket, "auth", "test_key");

protocol.send(socket, "instance/overview", "");
protocol.send(socket, "instance/new", {
  instanceName: "TestServer",
  command: "cmd.exe",
  cwd: ".",
  stopCommand: "^c"
});
protocol.send(socket, "instance/new", {
  instanceName: "TestServer2",
  command: "cmd2.exe",
  cwd: ".",
  stopCommand: "^c"
});
protocol.send(socket, "instance/open", {
  instanceName: "TestServer"
});

protocol.send(socket, "instance/command", {
  instanceName: "TestServer",
  command: "ping www.baidu.com"
});

setTimeout(() => {
  protocol.send(socket, "instance/stop", {
    instanceName: "TestServer"
  });
}, 3000);
