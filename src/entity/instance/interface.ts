/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-12 12:03:58
 * @LastEditTime: 2021-08-14 16:39:02
 * @Description:
 * @Projcet: MCSManager Daemon

 */

import { EventEmitter } from "events";

// interface of docker config
export interface IDockerConfig {
  image: string;
  memory: number; //以字节为单位的内存限制。
  ports: string[];
  cpu: number;
  maxSpace: number;
  network: number;
  io: number;
  networkMode: string;
  cpusetCpus: string; //允许执行的 CPU（例如0-3，，0,1）
}

// 实例具体进程接口
export interface IInstanceProcess extends EventEmitter {
  pid?: number | string;
  kill: (signal?: any) => any;
  destroy: () => void;
  write: (data?: any) => any;
}
