/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/
import { EventEmitter } from "events";

// interface of docker config
export interface IDockerConfig {
  containerName: string;
  image: string;
  memory: number; //以字节为单位的内存限制。
  ports: string[];
  extraVolumes: string[];
  maxSpace: number;
  network: number;
  io: number;
  networkMode: string;
  networkAliases: string[];
  cpusetCpus: string; //允许执行的 CPU（例如0-3，，0,1）
  cpuUsage: number;
}

// 实例具体进程接口
export interface IInstanceProcess extends EventEmitter {
  pid?: number | string;
  kill: (signal?: any) => any;
  destroy: () => void;
  write: (data?: any) => any;
}
