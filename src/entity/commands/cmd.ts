// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import Instance from "../instance/instance";
import InstanceCommand from "./base/command";
import { sanitizeCommand } from "./sanitize"; // assuming you have a sanitize function

export default class SendCommand extends InstanceCommand {
  private _cmd: string;

  constructor(cmd: string) {
    super("SendCommand");
    this.cmd = cmd;
  }

  public set cmd(cmd: string) {
    this._cmd = sanitizeCommand(cmd);
  }

  public get cmd(): string {
    return this._cmd;
  }

  async exec(instance: Instance) {
    return await instance.execPreset("command", this._cmd);
  }
}
