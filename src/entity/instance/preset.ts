/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

export interface IExecutable {
  exec: (a: any, b?: any) => Promise<any>;
  stop?: (a: any) => Promise<void>;
}

export class PresetCommandManager {
  public readonly preset = new Map<String, IExecutable>();

  constructor(private self: any) {}

  setPreset(action: string, cmd: IExecutable) {
    this.preset.set(action, cmd);
  }

  getPreset(action: string) {
    return this.preset.get(action);
  }

  async execPreset(action: string, p?: any) {
    const cmd = this.preset.get(action);
    if (!cmd) throw new Error(`预设命令 ${action} 不可用`);
    return await cmd.exec(this.self, p);
  }

  clearPreset() {
    this.preset.clear();
  }
}
