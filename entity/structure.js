/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-03-24 22:28:10
 * @LastEditTime: 2021-03-26 15:22:45
 * @Description: Saving and reading of data configuration
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

const fs = require("fs-extra");

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
}

module.exports = {
  DataStructure
};
