/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 22:28:10
 * @LastEditTime: 2021-03-26 16:31:10
 * @Description: Saving and reading of data configuration
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const fs = require("fs-extra");

// 数据模型类
// 用作数据与真实文件之间的抽象关系，数据模型保存的所有数据均会序列化成 JSON 格式保存在文件中
class DataStructure {
  constructor(filename) {
    this.__filename__ = filename + ".json";
  }

  load() {
    if (!fs.existsSync(this.__filename__)) return;
    let data = fs.readFileSync(this.__filename__, "utf-8");
    let ele = JSON.parse(data);
    for (var key in ele) {
      this[key] = ele[key];
    }
  }

  save() {
    fs.writeFileSync(this.__filename__, JSON.stringify(this, null, 4), { encoding: "utf-8" });
  }

  del() {
    fs.removeSync(this.__filename__);
  }

  exists() {
    return fs.existsSync(this.__filename__);
  }
}

module.exports = {
  DataStructure
};
