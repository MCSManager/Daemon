/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-08-28 14:54:53
 * @LastEditTime: 2021-08-28 16:56:58
 * @Description:
 */

export default class GlobalVariable {
  public static readonly map = new Map<string, any>();

  public static set(k: string, v: any) {
    GlobalVariable.map.set(k, v);
  }

  public static get(k: string, def?: any) {
    if (GlobalVariable.map.has(k)) {
      return GlobalVariable.map.get(k);
    } else {
      return def;
    }
  }

  public static del(k: string) {
    return GlobalVariable.map.delete(k);
  }
}
