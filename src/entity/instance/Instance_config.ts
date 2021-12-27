/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
*/

import Instance from "./instance";
import { IDockerConfig } from "./interface";

// @Entity
export default class InstanceConfig {
  public nickname = "Undefined";
  public startCommand = "";
  public stopCommand = "^C";
  public cwd = ".";
  public ie = "utf-8";
  public oe = "utf-8";
  public createDatetime = new Date().toLocaleDateString();
  public lastDatetime = "--";
  public type = Instance.TYPE_UNIVERSAL;
  public tag: string[] = [];
  public endTime: string = "";
  public fileCode: string = "utf-8";
  public processType: string = "general";

  // Event task
  public eventTask = {
    autoStart: false,
    autoRestart: false,
    ignore: false
  };

  // Extend
  public docker: IDockerConfig = {
    image: "",
    memory: 1024,
    ports: [],
    cpu: 1,
    maxSpace: 0,
    cpusetCpus: "",
    io: 0,
    network: 0,
    networkMode: "bridge"
  };

  public pingConfig = {
    ip: "",
    port: 25565,
    type: 1
  };
}
