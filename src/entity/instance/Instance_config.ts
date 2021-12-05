/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-12 12:04:13
 * @LastEditTime: 2021-08-14 16:39:07
 * @Description:
 * @Projcet: MCSManager Daemon

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
  public type = Instance.TYPE_UNIVERSAL; // Instance type like: Minecraft,Webwhell...
  public tag: string[] = []; // Instance tag like: Cloud1 Group2...
  public endTime: number = null;
  public processType: string = "general";

  // Event task
  public eventTask = {
    autoStart: false,
    autoRestart: false,
    ignore: false
  }

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
  }
}
