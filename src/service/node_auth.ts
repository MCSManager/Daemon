import { globalConfiguration } from "../entity/config";

export function initApiKey() {
  // 初始化全局配置服务
  globalConfiguration.load();
  const config = globalConfiguration.config;
}
