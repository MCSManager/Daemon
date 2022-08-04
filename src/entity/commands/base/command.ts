// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

export default class InstanceCommand {
  constructor(public info?: string) {}
  async exec(instance: any): Promise<any> {}
  async stop(instance: any) {}
}
