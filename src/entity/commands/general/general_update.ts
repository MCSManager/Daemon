// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import { killProcess } from "../../../common/process_tools";
import { ChildProcess, exec, spawn } from "child_process";
import logger from "../../../service/log";
import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import { commandStringToArray } from "../base/command_parser";
import iconv from "iconv-lite";
export default class GeneralUpdateCommand extends InstanceCommand {
  private pid: number = null;
  private process: ChildProcess = null;

  constructor() {
    super("GeneralUpdateCommand");
  }

  private stoped(instance: Instance) {
    instance.asynchronousTask = null;
    instance.setLock(false);
    instance.status(Instance.STATUS_STOP);
  }

  async exec(instance: Instance) {
    if (instance.status() !== Instance.STATUS_STOP) return instance.failure(new Error("实例状态不正确，无法执行更新任务，必须停止实例"));
    if (instance.asynchronousTask !== null) return instance.failure(new Error("实例状态不正确，有其他任务正在运行中"));
    try {
      instance.setLock(true);
      let updateCommand = instance.config.updateCommand;
      updateCommand = updateCommand.replace(/\$\{mcsm_workspace\}/gm, instance.config.cwd);
      logger.info(`实例 ${instance.instanceUuid} 正在准备进行更新操作...`);
      logger.info(`实例 ${instance.instanceUuid} 执行更新命令如下:`);
      logger.info(updateCommand);

      // 命令解析
      const commandList = commandStringToArray(updateCommand);
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);
      if (commandList.length === 0) {
        return instance.failure(new Error("更新命令格式错误，请联系管理员"));
      }

      // 启动更新命令
      const process = spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });
      if (!process || !process.pid) {
        this.stoped(instance);
        return instance.println("错误", "更新失败，更新命令启动失败，请联系管理员");
      }

      // process & pid 保存
      this.pid = process.pid;
      this.process = process;

      // 设置实例正在运行的异步任务
      instance.asynchronousTask = this;
      instance.status(Instance.STATUS_BUSY);

      process.stdout.on("data", (text) => {
        instance.print(iconv.decode(text, instance.config.oe));
      });
      process.stderr.on("data", (text) => {
        instance.print(iconv.decode(text, instance.config.oe));
      });
      process.on("exit", (code) => {
        this.stoped(instance);
        if (code === 0) {
          instance.println("更新", "更新成功！");
        } else {
          instance.println("更新", "更新程序结束，但结果不正确，可能文件更新损坏或网络不畅通");
        }
      });
    } catch (err) {
      this.stoped(instance);
      instance.println("更新", `更新错误: ${err}`);
    }
  }

  async stop(instance: Instance): Promise<void> {
    logger.info(`用户请求终止实例 ${instance.instanceUuid} 的 update 异步任务`);
    instance.println("更新", `用户请求终止实例 ${instance.instanceUuid} 的 update 异步任务`);
    instance.println("更新", `正在强制杀死任务进程...`);
    killProcess(this.pid, this.process);
  }
}
