// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { ILifeCycleTask } from "../../instance/life_cycle";
import Instance from "../../instance/instance";
import KillCommand from "../kill";

// When the instance is running, continue to check the expiration time
export default class TimeCheck implements ILifeCycleTask {
  public status: number = 0;
  public name: string = "openfrp";

  async start(instance: Instance) {}

  async stop(instance: Instance) {}
}
