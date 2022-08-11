// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../../../i18n";
import os from "os";
import Instance from "../../instance/instance";
import logger from "../../../service/log";
import fs from "fs-extra";
import path from "path";

import InstanceCommand from "../base/command";
import EventEmitter from "events";
import { IInstanceProcess } from "../../instance/interface";
import { ChildProcess, exec, spawn } from "child_process";
import { commandStringToArray } from "../base/command_parser";
import { killProcess } from "../../../common/process_tools";
import GeneralStartCommand from "../general/general_start";
import FunctionDispatcher from "../dispatcher";
import StartCommand from "../start";
import { PTY_PATH } from "../../../const";

// Error exception at startup
class StartupError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

// process adapter
class ProcessAdapter extends EventEmitter implements IInstanceProcess {
  pid?: number | string;

  constructor(private process: ChildProcess) {
    super();
    this.pid = this.process.pid;
    process.stdout.on("data", (text) => this.emit("data", text));
    process.stderr.on("data", (text) => this.emit("data", text));
    process.on("exit", (code) => this.emit("exit", code));
  }

  public write(data?: string) {
    return this.process.stdin.write(data);
  }

  public kill(s?: any) {
    return killProcess(this.pid, this.process, s);
  }

  public async destroy() {
    try {
      if (this.process && this.process.stdout && this.process.stderr) {
        // remove all dynamically added event listeners
        for (const eventName of this.process.stdout.eventNames()) this.process.stdout.removeAllListeners(eventName);
        for (const eventName of this.process.stderr.eventNames()) this.process.stderr.removeAllListeners(eventName);
        for (const eventName of this.process.eventNames()) this.process.removeAllListeners(eventName);
        this.process.stdout.destroy();
        this.process.stderr.destroy();
      }
    } catch (error) {}
  }
}

export default class PtyStartCommand extends InstanceCommand {
  constructor() {
    super("PtyStartCommand");
  }

  async exec(instance: Instance, source = "Unknown") {
    if (!instance.config.startCommand || !instance.config.cwd || !instance.config.ie || !instance.config.oe)
      return instance.failure(new StartupError($t("pty_start.cmdErr")));
    if (!fs.existsSync(instance.absoluteCwdPath())) return instance.failure(new StartupError($t("pty_start.cwdNotExist")));

    try {
      // PTY mode correctness check
      logger.info($t("pty_start.startPty", { source: source }));
      let checkPtyEnv = true;

      if (!fs.existsSync(PTY_PATH)) {
        instance.println("ERROR", $t("pty_start.startErr"));
        checkPtyEnv = false;
      }

      if ((os.platform() !== "linux" && os.platform() !== "win32") || os.arch() !== "x64") {
        instance.println("ERROR", $t("pty_start.notSupportPty"));
        checkPtyEnv = false;
      }

      if (checkPtyEnv === false) {
        // Close the PTY type, reconfigure the instance function group, and restart the instance
        instance.config.terminalOption.pty = false;
        await instance.forceExec(new FunctionDispatcher());
        await instance.execPreset("start", source); // execute the preset command directly
        return;
      }

      // Set the startup state & increase the number of startups
      instance.setLock(true);
      instance.status(Instance.STATUS_STARTING);
      instance.startCount++;

      // command parsing
      const commandList = commandStringToArray(instance.config.startCommand);
      if (commandList.length === 0) return instance.failure(new StartupError($t("pty_start.cmdEmpty")));
      const ptyParameter = [
        "-dir",
        instance.config.cwd,
        "-cmd",
        JSON.stringify(commandList),
        "-size",
        `${instance.config.terminalOption.ptyWindowCol},${instance.config.terminalOption.ptyWindowRow}`,
        "-color"
      ];

      logger.info("----------------");
      logger.info($t("pty_start.sourceRequest", { source: source }));
      logger.info($t("pty_start.instanceUuid", { instanceUuid: instance.instanceUuid }));
      logger.info($t("pty_start.startCmd", { cmd: commandList.join(" ") }));
      logger.info($t("pty_start.ptyPath", { path: PTY_PATH }));
      logger.info($t("pty_start.ptyParams", { param: ptyParameter.join(" ") }));
      logger.info($t("pty_start.ptyCwd", { cwd: instance.config.cwd }));
      logger.info("----------------");

      // create child process
      // Parameter 1 directly passes the process name or path (including spaces) without double quotes
      // console.log(path.dirname(ptyAppPath));
      const subProcess = spawn(PTY_PATH, ptyParameter, {
        cwd: path.dirname(PTY_PATH),
        stdio: "pipe",
        windowsHide: true
      });

      // child process creation result check
      if (!subProcess || !subProcess.pid) {
        instance.println(
          "ERROR",
          $t("pty_start.ptyCwd", { startCommand: instance.config.startCommand, path: PTY_PATH, params: JSON.stringify(ptyParameter) })
        );
        throw new StartupError($t("pty_start.instanceStartErr"));
      }

      // create process adapter
      const processAdapter = new ProcessAdapter(subProcess);

      // generate open event
      instance.started(processAdapter);
      logger.info($t("pty_start.startSuccess", { instanceUuid: instance.instanceUuid, pid: process.pid }));
      instance.println("INFO", $t("pty_start.startEmulatedTerminal"));
    } catch (err) {
      instance.instanceStatus = Instance.STATUS_STOP;
      instance.releaseResources();
      return instance.failure(err);
    }
  }
}
