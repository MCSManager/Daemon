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

import { v4 } from "uuid";
import StorageSubsystem from "../common/system_storage";

function builderPassword() {
  const a = `${v4().replace(/\-/gim, "")}`;
  const b = a.slice(0, a.length / 2 - 1);
  const c = `${v4().replace(/\-/gim, "")}`;
  return b + c;
}

// @Entity
class Config {
  public version = 2;
  public ip = "";
  public port = 24444;
  public key = builderPassword();
  public maxFileTask = 2;
}

// 守护进程配置类
class GlobalConfiguration {
  public config = new Config();
  private static readonly ID = "global";

  load() {
    let config: Config = StorageSubsystem.load("Config", Config, GlobalConfiguration.ID);
    if (config == null) {
      config = new Config();
      StorageSubsystem.store("Config", GlobalConfiguration.ID, config);
    }
    this.config = config;
  }

  store() {
    StorageSubsystem.store("Config", GlobalConfiguration.ID, this.config);
  }
}

class GlobalEnv {
  public fileTaskCount = 0;
}

const globalConfiguration = new GlobalConfiguration();
const globalEnv = new GlobalEnv();

export { globalConfiguration, Config, globalEnv };
