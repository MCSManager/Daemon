/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 16:29:08
 * @LastEditTime: 2021-07-26 09:45:18
 * @Description: 实例储存管理子系统，一个微型的ORM模块，可以用于较少量的数据储存和增删查改。
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

import path from "path";
import fs from "fs-extra";

interface IClassz {
  name: string;
}

class StorageSubsystem {
  public static readonly STIRAGE_DATA_PATH = path.normalize(path.join(process.cwd(), "data"));
  public static readonly STIRAGE_INDEX_PATH = path.normalize(path.join(process.cwd(), "data", "index"));

  /**
   * 根据类定义和标识符储存成本地文件
   * @param {any} classz 储存对象的类定义
   * @param {string} uuid 储存对象的唯一标识符
   * @param {any} object 储存对象
   */
  public store(classz: IClassz, uuid: string, object: any) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, classz.name);
    if (!fs.existsSync(dirPath)) fs.mkdirsSync(dirPath);
    const filePath = path.join(dirPath, `${uuid}.json`);
    const data = JSON.stringify(object, null, 4);
    fs.writeFileSync(filePath, data, { encoding: "utf-8" });
  }

  /**
   * 根据类定义和标识符实例化成对象
   * @param {any} classz 储存对象的类定义
   * @param {string} uuid 储存对象的唯一标识符
   * @return {any} 返回类定义实例
   */
  public load(classz: any, uuid: string) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, classz.name);
    if (!fs.existsSync(dirPath)) fs.mkdirsSync(dirPath);
    const filePath = path.join(dirPath, `${uuid}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, { encoding: "utf-8" });
    const dataObject = JSON.parse(data);
    const target = new classz();
    for (const v of Object.keys(target)) {
      if (dataObject[v] !== undefined) target[v] = dataObject[v];
    }
    return target;
  }

  /**
   * 通过类定义返回所有与此类有关的标识符
   * @param {any} classz 类定义
   * @return {string[]} 唯一标识符列表
   */
  public list(classz: IClassz) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, classz.name);
    const files = fs.readdirSync(dirPath);
    const result = new Array<string>();
    files.forEach((name) => {
      result.push(name.replace(path.extname(name), ""));
    });
    return result;
  }

  /**
   * 通过类定义删除指定类型的标识符实例
   * @param {any} classz 类定义
   * @return {string[]} 唯一标识符列表
   */
  public delete(classz: IClassz, uuid: string) {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, classz.name, `${uuid}.json`);
    if (!fs.existsSync(filePath)) return;
    fs.removeSync(filePath);
  }
}

export default new StorageSubsystem();
