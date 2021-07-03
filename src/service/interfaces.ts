/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 12:51:36
 * @LastEditTime: 2021-06-27 14:31:13
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

export interface IInstanceDetail {
  instanceUuid: string;
  started: number;
  status: number;
  config: any;
  info?: any;
}

// export interface IForwardInstanceIO {
//   sourceSocket: Socket,
//   targetUuid: string
// }
