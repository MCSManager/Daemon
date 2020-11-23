/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2020-11-23 17:47:49
 * @Description: 实例服务测试类
 */

const { Instance } = require("../service/instance");
const { instanceService } = require("../service/instance_service");

const instance = new Instance("XXX");
instance.setStartCommand("cmd.exe");
instance.setCwd("C:/");

instanceService.addInstance(instance);
const resInstance = instanceService.getInstance("XXX");

instance.on("data", (text) => {
  console.log("[STDOUT]:", text);
});

instance.on("exit", (code) => {
  console.log("程序已经退出:", code);
  // instanceService.removeInstance(resInstance.instanceName);
  console.log("剩余的：", resInstance);
});

try {
  resInstance.start();
  resInstance.sendCommand("echo 你好，这里是中文测试 ABCDEFG 嗨喽");
  resInstance.sendCommand("dir");
  resInstance.sendCommand("ping www.baidu.com");
  resInstance.sendCommand("exit");
  // resInstance.kill();
} catch (err) {
  console.log(err);
}
