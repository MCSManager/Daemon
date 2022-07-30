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
  permission: {},
  instance: {
    dirEmpty: "启动命令，输入输出编码或工作目录为空值",
    dirNoE: "工作目录并不存在",
    invalidCpu: "非法的CPU核心指定 {{v}}",
    invalidContainerName: "非法的容器名 {{v}}",
    successful: "实例 {{v}} 启动成功"
  },
  command: {
    quotes: "错误的命令双引号，无法找到成对双引号，如需使用单个双引号请使用 {quotes} 符号",
    errLen: "错误的命令长度，请确保命令格式正确",
    instanceNotOpen: "命令执行失败，因为实例实际进程不存在"
  },
  restart: {
    start: "重启实例计划开始执行",
    error1: "重启实例状态错误，实例已被启动过，上次状态的重启计划取消",
    error2: "重启实例状态错误，实例状态应该为停止中状态，现在变为正在运行，重启计划取消",
    restarting: "检测到服务器已停止，正在重启实例..."
  }
};
// import { $t } from "../../i18n";
// $t("permission.forbiddenInstance");]
// $t("router.login.ban")
