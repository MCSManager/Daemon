/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-28 09:40:44
 * @Description: 守护进程配置类
 */

const uuid = require("uuid");
const { DataStructure } = require("./structure");
const path = require("path");
// const fs = require("fs-extra");

// 守护进程配置类
class Config extends DataStructure {
  constructor() {
    super("config");

    // 配置项目
    this.version = 1;
    this.port = 24444;
    this.key = this.initKey();

    // 数据相关目录
    this.dataDirectory = path.normalize(path.join(process.cwd(), "data"));
    this.instanceDirectory = path.normalize(path.join(this.dataDirectory, "instances"));

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
  config
};
