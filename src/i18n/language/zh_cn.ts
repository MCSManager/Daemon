export default {
  common: {
    title: "标题"
  },
  // src\app.ts
  app: {
    welcome: "欢迎使用 MCSManager 守护进程",
    instanceLoad: "所有应用实例已加载，总计 {{n}} 个",
    instanceLoadError: "读取本地实例文件失败:",
    sessionConnect: "会话 {{ip}} {{uuid}} 已连接",
    sessionDisconnect: "会话 {{ip}} {{uuid}} 已断开",
    started: "守护进程现已成功启动",
    doc: "参考文档：https://docs.mcsmanager.com/",
    addr: "访问地址：http://<IP地址>:{{port}}/ 或 ws://<IP地址>:{{port}}",
    configPathTip: "配置文件：data/Config/global.json",
    password: "访问密钥：{{key}}",
    passwordTip: "密钥作为守护进程唯一认证手段"
  },
  // src\app\middleware\permission.ts
  permission: {}
};
// import { $t } from "../../i18n";
// $t("permission.forbiddenInstance");]
// $t("router.login.ban")
