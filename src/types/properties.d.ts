/*
  Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>
*/

declare module "properties" {
  function parse(data: string, options?: any): any;
  function stringify(data: any, options?: any): string;

  export { parse, stringify };
}
