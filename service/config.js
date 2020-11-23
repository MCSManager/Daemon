/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2020-11-23 17:52:09
 * @Description: 守护进程配置类
 */


const fs = require("fs-extra");
const uuid = require("uuid");

// 数据模型类
// 用作数据与真实文件之间的抽象关系，数据模型保存的所有数据均会序列化成 JSON 格式保存在文件中。
// 来自 https://github.com/Suwings/MCSManager/blob/master/core/DataModel.js
class DataModel {
  constructor(filename) {
    this.__filename__ = filename + ".json";
  }

  filename(newFilename) {
    if (newFilename) {
      fs.renameSync(this.__filename__, newFilename);
      this.__filename__ = newFilename + ".json";
      this.save();
    } else return this.__filename__;
  }

  load() {
    let data = fs.readFileSync(this.__filename__, "utf-8");
    let ele = JSON.parse(data);
    for (var key in ele) {
      this[key] = ele[key];
    }
  }

  save() {
    fs.writeFileSync(this.__filename__, JSON.stringify(this, null, 4), { encoding: "utf-8" });
  }

  exists() {
    return fs.existsSync(this.__filename__);
  }
}

// 守护进程配置类
class Config extends DataModel {
  constructor() {
    super("daemon");
    // 配置项目
    this.version = 1;
    this.port = 24444;
    this.key = this.initKey();
    // 自动初始化
    if (this.exists()) {
      // 先读取载入一遍数据，再保存数据以适应未来版本的新增字段
      this.load();
    }
    this.save();
  }

  initKey() {
    const key = uuid.v4().replace(/-/gim, "");
    return key;
  }
}

const config = new Config();

module.exports = {
  DataModel,
  config
};
