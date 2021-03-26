/* eslint-disable no-undef */
/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-26 14:57:35
 * @Description: 实例服务测试类
 */

const { Instance } = require("../entity/instance");
const { instanceService } = require("../service/instance_service");

const { StartCommand } = require("../entity/commands/start");
const { SendCommand } = require("../entity/commands/cmd");
// const { KillCommand } = require("../entity/commands/kill");
const { StopCommand } = require("../entity/commands/stop");
// const { describe, it } = require("mocha");

// var assert = require('assert');
describe("实例应用的基本测试", function () {
  it("创建实例", function () {
    const instance = new Instance("XXX");
    instance.parameters({
      startCommand: "cmd.exe",
      stopCommand: "^c",
      cwd: ".",
      ie: "GBK",
      oe: "GBK"
    });

    instanceService.addInstance(instance);
    // const resInstance = instanceService.getInstance("XXX");
    return true;
  });

  it("运行实例", function () {
    const instance = instanceService.getInstance("XXX");
    // instance.on("data", (text) => {
    //   console.log("[STDOUT]:", text);
    // });
    // instance.on("exit", (code) => {
    //   console.log("程序已经退出:", code);
    // });
    instance.execCommand(new StartCommand());
    return true;
  });

  it("执行操作", function () {
    const resInstance = instanceService.getInstance("XXX");
    resInstance.execCommand(new SendCommand("echo 测试输出内容开始"));
    resInstance.execCommand(new SendCommand("ping www.baidu.com"));
    resInstance.execCommand(new SendCommand("echo 测试输出内容结束"));
    // setTimeout(() => resInstance.execCommand(new KillCommand()), 3000);
    setTimeout(() => resInstance.execCommand(new StopCommand()), 6000);
    return true;
  });
});
