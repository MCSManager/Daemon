/* eslint-disable no-undef */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 15:40:35
 * @Description: Socket 基本通信与基本功能测试类
 */

const io = require("socket.io-client");

const connectConfig = {
  multiplex: false,
  reconnectionDelayMax: 1000,
  timeout: 1000,
  query: {
    token: "test"
  }
};
const ip = "ws://127.0.0.1:24444";

describe("基于 Socket.io 的控制器层测试", function () {

  it("身份验证", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      // console.log(">>>: ", msg);
      if (msg.status === 200 && msg.data === true && msg.event == "auth") {
        socket.close()
        done();
      }
      else
        done(new Error("测试失败"));
    });
    // client = socket;
    socket.emit("auth", "test_key");

  });

  it("新建实例", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      // console.log(">>>: ", msg);
      if ((msg.status === 200 || msg.status === 500) && msg.event == "instance/new") {
        socket.close()
        done();
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/new", {
      instanceName: "TestServer",
      command: "cmd.exe",
      cwd: ".",
      stopCommand: "^c"
    });
  });

  it("开启实例", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {

      if ((msg.status === 200 || msg.status === 500) && msg.event == "instance/opened") {
        // console.log(">>>: ", msg);
        setTimeout(() => done(), 1000)
      }
      if (msg.event == "instance/stdout") {
        console.log("[Console]:", msg.data.text);
        return;
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/open", {
      instanceName: "TestServer"
    });
  });

  it("关闭实例", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      // console.log(">>>: ", msg);
      if (msg.status === 200 && msg.event == "instance/stop") {
        socket.close()
        done();
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/stop", {
      instanceName: "TestServer"
    });
  });

  it("服务器总览", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      if (msg.status === 200 && msg.event == "instance/overview") {
        // console.log(">>>: ", msg);
        socket.close()
        if (msg.data.length >= 1) {
          done();
        } else {
          done(new Error("服务器消失，数量不足1"))
        }
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/overview", {
      instanceName: "TestServer"
    });
  });

  it("删除实例并验证", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      // console.log(">>>: ", msg);
      if (msg.status !== 200 && msg.event == "instance/delete")
        done(new Error("删除代码不等于 200"));
      if (msg.status === 200 && msg.event == "instance/overview") {
        if (msg.data.length === 0) {
          socket.close()
          done();
        }
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/delete", {
      instanceName: "TestServer"
    });
    socket.emit("instance/overview", {
      instanceName: "TestServer"
    });
  });




});

// protocol.send(socket, "instance/overview", "");
// protocol.send(socket, "instance/new", {
//   instanceName: "TestServer",
//   command: "cmd.exe",
//   cwd: ".",
//   stopCommand: "^c"
// });
// protocol.send(socket, "instance/new", {
//   instanceName: "TestServer2",
//   command: "cmd2.exe",
//   cwd: ".",
//   stopCommand: "^c"
// });
// protocol.send(socket, "instance/open", {
//   instanceName: "TestServer"
// });

// protocol.send(socket, "instance/command", {
//   instanceName: "TestServer",
//   command: "ping www.baidu.com"
// });

// setTimeout(() => {
//   protocol.send(socket, "instance/stop", {
//     instanceName: "TestServer"
//   });
// }, 3000);
