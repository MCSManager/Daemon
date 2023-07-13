// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

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
  public ssl = false;
  public sslKeyfile = "./data/ssl/privkey.key";
  public sslCertfile = "./data/ssl/fullchain.pem";
  public httpsPort = 24443;
  public maxFileTask = 2;
  public maxZipFileSize = 60;
  public language = "en_us";
  public defaultInstancePath = "";
}

// daemon configuration class
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

export { Config, globalConfiguration, globalEnv };

