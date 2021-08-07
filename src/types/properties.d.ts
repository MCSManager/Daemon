/*
 * @Author: Copyright(c) 2021 Suwings
 * @Date: 2021-07-29 10:15:23
 * @LastEditTime: 2021-07-31 15:35:32
 * @Description:
 * @Projcet: MCSManager Daemon
 */

declare module "properties" {
  function parse(data: string, options?: any): any;
  function stringify(data: any, options?: any): string;

  export { parse, stringify };
}
