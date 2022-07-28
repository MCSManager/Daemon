/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

import InstanceCommand from "./base/command";

export default class NullCommand extends InstanceCommand {
  constructor() {
    super("NullCommand");
  }
  async exec() {
    // Do nothing.....
  }
}
