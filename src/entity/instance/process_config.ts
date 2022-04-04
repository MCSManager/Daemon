/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
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
