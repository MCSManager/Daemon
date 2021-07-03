/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-06-27 20:14:13
 * @Description: 守护进程配置类
 */

import { v4 } from "uuid";
import path from "path";
import StorageSubsystem from "../common/system_storage";
// import DataStructure from "./structure";

// @Entity
class Config {
  public version = 1;
  public port = 24444;
  public key = "test_key";
  public dataDirectory = path.normalize(path.join(process.cwd(), "data"));
}

// 守护进程配置类
class GlobalConfiguration {
  public config = new Config();
  private static readonly ID = "global";

  key() {
    const key = v4().replace(/-/gim, "");
    return key;
  }

  load() {
    let config: Config = StorageSubsystem.load(Config, GlobalConfiguration.ID);
    if (config == null) {
      config = new Config();
      StorageSubsystem.store(Config, GlobalConfiguration.ID, config);
    }
    this.config = config;
  }

  store() {
    StorageSubsystem.store(Config, GlobalConfiguration.ID, this.config);
  }
}
const globalConfiguration = new GlobalConfiguration();
export { globalConfiguration, Config };
