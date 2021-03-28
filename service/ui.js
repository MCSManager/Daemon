/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-26 18:41:40
 * @LastEditTime: 2021-03-28 11:59:38
 * @Description: 终端交互逻辑，由于逻辑简单且均无需认证与检查，所有UI业务代码将全部在一个文件。
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("[User Interface] 程序拥有简易的终端交互功能，键入 help 得以查看更多信息.")

function stdin() {
  rl.question('> ', (answer) => {
    try {
      const cmds = answer.split(" ");
      logger.info(`[终端] ${answer}`);
      const result = command(...cmds);
      if (result)
        console.log(result);
      else
        console.log(`命令 ${answer} 并不存在，键入 help 得以获取帮助.`);
    } catch (err) {
      logger.error("[终端]", err);
    } finally {
      // next
      stdin();
    }
  });
}

stdin();

const { instanceService } = require("./instance_service");
const protocol = require("./protocol");
const { config } = require("../entity/config");
const { logger } = require('./log');
const { StartCommand } = require('../entity/commands/start');
const { StopCommand } = require('../entity/commands/stop');
const { KillCommand } = require('../entity/commands/kill');
const { SendCommand } = require('../entity/commands/cmd');
// const { logger } = require('./log');

/**
 * 传入相关UI命令，输出命令结果
 * @param {String} cmd
 * @return {String}
 */
function command(cmd, p1, p2, p3) {

  if (cmd === "instance") {
    if (p1 === "start") {
      instanceService.getInstance(p2).exec(new StartCommand("Terminal"));
      return "Done.";
    }
    if (p1 === "stop") {
      instanceService.getInstance(p2).exec(new StopCommand());
      return "Done.";
    }
    if (p1 === "kill") {
      instanceService.getInstance(p2).exec(new KillCommand());
      return "Done.";
    }
    if (p1 === "send") {
      instanceService.getInstance(p2).exec(new SendCommand(p3));
      return "Done.";
    }
    return "参数错误";
  }

  if (cmd === "instances") {
    const objs = instanceService.getAllInstance();
    let result = "实例名称 | 实例 UUID | 状态码\n";
    for (const id in objs) {
      const instance = objs[id];
      result += `${instance.config.nickname} ${instance.instanceUUID} ${instance.status()}\n`;
    }
    result += "\n状态解释:\n 忙碌=-1;停止=0;停止中=1;开始中=2;正在运行=3;\n";
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

  if (cmd == "exit") {
    try {
      logger.info("正在准备关闭守护进程...");
      config.save();
      instanceService.exit();
      logger.info("数据保存完毕，感谢使用，再见！");
      logger.info("The data is saved, thanks for using, goodbye!");
      logger.info("process.exit(0);");
      process.exit(0);
    } catch (err) {
      logger.error("结束程序失败，请检查文件权限后重试几次，依然无法关闭请使用 Ctrl+C 关闭.", err);
    }
  }

  if (cmd == "help") {
    console.log("----------- 帮助文档 -----------");
    console.log(" instances     查看所有实例");
    console.log(" sockets       查看所有链接者");
    console.log(" key           查看密匙");
    console.log(" exit          关闭本程序（推荐方法）");
    console.log(" instance start <UUID>       启动指定实例");
    console.log(" instance stop <UUID>        启动指定实例");
    console.log(" instance kill <UUID>        启动指定实例");
    console.log(" instance send <UUID> <CMD>  向实例发送命令");
    console.log("----------- 帮助文档 -----------");
    return "\n";
  }

}
