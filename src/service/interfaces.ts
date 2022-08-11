// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import InstanceConfig from "../entity/instance/Instance_config";
export interface IInstanceDetail {
  instanceUuid: string;
  started: number;
  status: number;
  config: InstanceConfig;
  info?: any;
}

// export interface IForwardInstanceIO {
//   sourceSocket: Socket,
//   targetUuid: string
// }
