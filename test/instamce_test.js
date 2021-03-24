/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-24 23:10:44
 * @Description: 实例服务测试类
 */

const { Instance } = require("../service/instance");
const { instanceService } = require("../service/instance_service");

const { StartCommand } = require("../entity/commands/start");
const { SendCommand } = require("../entity/commands/cmd");
const { KillCommand } = require("../entity/commands/kill");


const instance = new Instance("XXX");
instance.parameters({
  startCommand: "cmd.exe",
  stopCommand: "^c",
  cwd: ".",
  ie: "GBK",
  oe: "GBK"
});

instanceService.addInstance(instance);
const resInstance = instanceService.getInstance("XXX");


instance.on("data", (text) => {
  console.log("[STDOUT]:", text);
});

instance.on("exit", (code) => {
  console.log("程序已经退出:", code);
  // instanceService.removeInstance(resInstance.instanceName);
  // console.log("剩余的：", resInstance);
});


resInstance.execCommand(new StartCommand());
try {
  resInstance.execCommand(new SendCommand("echo 你好，这里是中文测试 ABCDEFG 嗨喽1"))
  resInstance.execCommand(new SendCommand("echo 你好，这里是中文测试 ABCDEFG 嗨喽2"))
  resInstance.execCommand(new SendCommand("echo 你好，这里是中文测试 ABCDEFG 嗨喽3"))
  setTimeout(() => resInstance.execCommand(new KillCommand()), 1000)
} catch (err) {
  console.log(err);
}
