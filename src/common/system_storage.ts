/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-05-11 16:29:08
 * @LastEditTime: 2021-09-08 22:52:25
 * @Description: 实例储存管理子系统，一个微型的ORM模块，可以用于较少量的数据储存和增删查改。
 * @Projcet: MCSManager Daemon

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
   */
  public store(category: string, uuid: string, object: any) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, category);
    if (!fs.existsSync(dirPath)) fs.mkdirsSync(dirPath);
    const filePath = path.join(dirPath, `${uuid}.json`);
    const data = JSON.stringify(object, null, 4);
    fs.writeFileSync(filePath, data, { encoding: "utf-8" });
  }

  /**
   * 根据类定义和标识符实例化成对象
   */
  public load(category: string, classz: any, uuid: string) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, category);
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
   */
  public list(category: string) {
    const dirPath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, category);
    if (!fs.existsSync(dirPath)) fs.mkdirsSync(dirPath);
    const files = fs.readdirSync(dirPath);
    const result = new Array<string>();
    files.forEach((name) => {
      result.push(name.replace(path.extname(name), ""));
    });
    return result;
  }

  /**
   * 通过类定义删除指定类型的标识符实例
   */
  public delete(category: string, uuid: string) {
    const filePath = path.join(StorageSubsystem.STIRAGE_DATA_PATH, category, `${uuid}.json`);
    if (!fs.existsSync(filePath)) return;
    fs.removeSync(filePath);
  }
}

export default new StorageSubsystem();
