/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您必须保留所有版权声明，如果修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
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
