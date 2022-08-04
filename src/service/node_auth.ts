// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { globalConfiguration } from "../entity/config";

export function initApiKey() {
  // 初始化全局配置服务
  globalConfiguration.load();
  const config = globalConfiguration.config;
}
