/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-26 18:41:40
 * @LastEditTime: 2021-03-28 09:27:59
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("[User Interface] 程序拥有简易的 UI 系统，请输入 help 以查看更多帮助.")

function stdin() {
  rl.question('> ', (answer) => {

    if (answer == "help") {
      console.log("----------- 帮助文档 -----------");
      console.log(" instances     查看所有实例");
      console.log(" sockets       查看所有链接者");
      console.log(" key           查看密匙");
      console.log("----------- 帮助文档 -----------");
    }

    const result = command(answer);
    console.log(result);

    stdin();
  });
}

stdin();

const { instanceService } = require("./instance_service");
const protocol = require("./protocol");
const { config } = require("../entity/config");

/**
 * 传入相关UI命令，输出命令结果
 * @param {String} cmd
 * @return {String}
 */
function command(cmd) {
  if (cmd === "instances") {
    const objs = instanceService.getAllInstance();
    let result = "实例名称 | 实例标识符 | 状态码\n";
    for (const id in objs) {
      const instance = objs[id];
      result += `${instance.config.nickname} ${instance.instanceName} ${instance.status()}\n`;
    }
    result += "\n状态码解释:\n忙碌 = -1; 停止 = 0;\n停止中 = 1; 开始中 = 2;\n正在运行 = 3;\n";
    return result;
  }

  if (cmd === "sockets") {
    const sockets = protocol.socketObjects();
    let result = "";
    let count = 0;
    result += " IP 地址      |      会话标识符\n";
    for (const id in sockets) {
      count++;
      result += `${sockets[id].handshake.address}  ${id}\n`;
    }
    result += (`总计 ${count} 在线.\n`);
    return result;
  }

  if (cmd == "key") {
    return config.key;
  }
}
