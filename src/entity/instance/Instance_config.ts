/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-12 12:04:13
 * @LastEditTime: 2021-06-29 11:54:04
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
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
  public maxSpace: number = null; // GB
  public endTime: number = null;

  // Extend
  public docker: IDockerConfig = { image: "", xmx: 1024, ports: [], cpu: 1 };
}
