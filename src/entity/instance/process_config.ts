/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import yaml from "yaml";
import properties from "properties";
import path from "path";
import fs from "fs-extra";

const CONFIG_FILE_ENCODE = "utf-8";

export interface IProcessConfig {
  fileName: string;
  path: string;
  type: string;
  info: string;
  redirect: string;
  from?: string;
  fromLink?: string;
}

export class ProcessConfig {
  constructor(public iProcessConfig: IProcessConfig) {
    iProcessConfig.path = path.normalize(iProcessConfig.path);
  }

  // 自动根据类型解析本地文件并返回配置对象
  read(): any {
    const text = fs.readFileSync(this.iProcessConfig.path, { encoding: CONFIG_FILE_ENCODE });
    if (this.iProcessConfig.type === "yml") {
      return yaml.parse(text);
    }
    if (this.iProcessConfig.type === "properties") {
      return properties.parse(text);
    }
    if (this.iProcessConfig.type === "json") {
      return JSON.parse(text);
    }
    if (this.iProcessConfig.type === "txt") {
      return text;
    }
  }

  // 自动根据参数对象保存到本地配置文件
  write(object: Object) {
    let text = "";
    if (this.iProcessConfig.type === "yml") {
      text = yaml.stringify(object);
    }
    if (this.iProcessConfig.type === "properties") {
      text = properties.stringify(object);
      text = text.replace(/ = /gim, "=");
      if (this.iProcessConfig.fileName == "server.properties") {
        text = text.replace(/\\\\u/gim, "\\u");
      }
    }
    if (this.iProcessConfig.type === "json") {
      text = JSON.stringify(object);
    }
    if (this.iProcessConfig.type === "txt") {
      text = object.toString();
    }
    if (!text) throw new Error("写入内容为空，可能是配置文件类型不支持");
    fs.writeFileSync(this.iProcessConfig.path, text, { encoding: CONFIG_FILE_ENCODE });
  }

  exists() {
    return fs.existsSync(this.iProcessConfig.path);
  }
}
