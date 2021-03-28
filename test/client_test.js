/* eslint-disable no-undef */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-28 12:28:09
 * @Description: Socket 基本通信与基本功能测试类
 */

// const fs = require("fs-extra");
const io = require("socket.io-client");
// var should = require('should');

const connectConfig = {
  multiplex: false,
  reconnectionDelayMax: 1000,
  timeout: 2000
};
const ip = "ws://127.0.0.1:24444";

let testServerID = "7e498901057c41b097afdf38478ce89a";
let preDelServerUUID = "";

describe("基于 Socket.io 的控制器层测试", function () {

  it("身份验证", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => { // 这里的 protocol 事件是固定的，由服务端返回
      // console.log(">>>: ", msg);
      // 判定返回状态码
      if (msg.status === 200 && msg.data === true && msg.event == "auth") {
        socket.close()
        done(); // 成功执行 done
      }
      else
        done(new Error("测试失败")); // 失败执行
    });
    // client = socket;
    socket.emit("auth", "test_key");
  });

  it("启动进程", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      // console.log(">>>: ", msg);
      if (msg.status === 200 && msg.event == "instance/new") {
        preDelServerUUID = msg.data.instanceUUID;
        socket.close()
        done();
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/new", {
      nickname: "TestServer1",
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
        // 这里后续的试输出也会用到
        console.log("[Console]:", msg.data.text);
        return;
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/open", {
      instanceUUID: testServerID
    });
  });

  it("向实例发送命令", function (done) {
    const socket = io.connect(ip, connectConfig);
    var f = 0;
    socket.on("protocol", (msg) => {
      if ((msg.status === 200) && msg.event == "instance/command") {
        // console.log(">>>: ", msg);
        // setTimeout(() => done(), 1200);
        f++;
      }
      if (msg.event == "instance/stdout" && f == 1) {
        if (msg.data.text.indexOf("Test你好123") !== -1) {
          socket.close()
          done();
        }
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/command", {
      instanceUUID: testServerID,
      command: "echo Test你好123"
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
      instanceUUID: testServerID
    });
  });

  it("服务器总览", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      if (msg.status === 200 && msg.event == "instance/overview") {
        console.log(">>>: ", msg);
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
      instanceUUID: testServerID
    });
  });

  // it("读本地服务器文件", function () {
  //   const text = fs.readFileSync(".data/TestServer.json", "utf-8")
  //   should(text).have.String();
  //   console.log("本地文件储存如下:", text);
  // })

  it("删除实例并验证", function (done) {
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      console.log(">>>: ", msg);
      if (msg.status !== 200 && msg.event == "instance/delete")
        done(new Error("删除代码不等于 200"));
      if (msg.status === 200 && msg.event == "instance/overview") {
        if (msg.data.length != 0) {
          socket.close()
          done();
        }
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/delete", {
      instanceUUID: preDelServerUUID
    });
    socket.emit("instance/overview", {
      instanceUUID: preDelServerUUID
    });
  });


  it("无权限情况下一些操作", function (done) {
    let count = 0;
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      console.log(">>>: ", msg);
      if (msg.status == 500 && msg.event == "error") {
        count++;
        // 计算是否返回了 6个错误码（500）,如果是则测试成功
        if (count >= 6) {
          done();
          socket.close();
        }
      }
    });
    // 身份认证
    socket.emit("auth", "test_kedsdy1");
    socket.emit("instance/overview", { // 无权限状态查看所有远程程序
      instanceUUID: testServerID
    });
    socket.emit("instance/new", {// 无权限状态创建远程程序
      instanceUUID: testServerID
    });
    socket.emit("instance/open", {// 无权限状态开启远程程序
      instanceUUID: testServerID
    });
    socket.emit("instance/stop", {// 无权限状态停止远程程序
      instanceUUID: testServerID
    });
    socket.emit("instance/delete", {// 无权限状态删除远程程序
      instanceUUID: testServerID
    });
    socket.emit("instance/command", {// 无权限状态发送远程程序命令
      instanceUUID: testServerID,
      command: "echo Test你好123"
    });
  });


  it("操作一些不存在的服务器", function (done) {
    let count = 0;
    const socket = io.connect(ip, connectConfig);
    socket.on("protocol", (msg) => {
      console.log(">>>: ", msg);
      if (msg.status == 500) {
        count++;
        if (count >= 4) {
          done();
          socket.close();
        }
      }
    });
    socket.emit("auth", "test_key");
    socket.emit("instance/open", {
      instanceUUID: "splofjasoih"
    });
    socket.emit("instance/stop", {
      instanceUUID: "splofjasoih"
    });
    socket.emit("instance/delete", {
      instanceUUID: "splofjasoih"
    });
    socket.emit("instance/command", {
      instanceUUID: "splofjasoih",
      command: "echo Test你好123"
    });
  });

});
