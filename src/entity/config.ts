/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-09-08 22:51:56
 * @Description: 守护进程配置类
 */

import { v4 } from "uuid";
import StorageSubsystem from "../common/system_storage";

function builderPassword() {
  const a = `${v4().replace(/\-/igm, "")}`
  const b = a.slice(0, a.length / 2 - 1);
  const c = `${v4().replace(/\-/igm, "")}`;
  return b + c;
}

// @Entity
class Config {
  public version = 1;
  public ip = "";
  public port = 24444;
  public key = builderPassword();
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
const globalConfiguration = new GlobalConfiguration();
export { globalConfiguration, Config };
