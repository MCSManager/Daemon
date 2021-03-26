/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-26 18:41:40
 * @LastEditTime: 2021-03-26 18:51:56
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


    stdin();
  });
}

stdin();


