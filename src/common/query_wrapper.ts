/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-07-25 10:03:28
 * @LastEditTime: 2021-07-26 09:44:40
 * @Description:
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

interface IMap {
  size: number;
  forEach: (value: any, key?: any) => void;
}

// 供给路由层使用的MAP型查询接口
export class QueryMapWrapper {
  constructor(public map: IMap) {}

  select<T>(condition: (v: T) => boolean): T[] {
    const result: T[] = [];
    this.map.forEach((v: T) => {
      if (condition(v)) result.push(v);
    });
    return result;
  }

  page<T>(data: T[], page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let size = data.length;
    let maxPage = 0;
    while (size > 0) {
      size -= pageSize;
      maxPage++;
    }
    return {
      page,
      pageSize,
      maxPage,
      data: data.slice(start, end)
    };
  }
}

// 供 QueryWrapper 使用的数据源接口
export interface IDataSource {
  selectPage: (condition: any, page: number, pageSize: number) => any;
  select: (condition: any) => any[];
  update: (condition: any, data: any) => void;
  delete: (condition: any) => void;
  insert: (data: any) => void;
}

// MYSQL 数据源
export class MySqlSource<T> implements IDataSource {
  selectPage: (condition: any, page: number, pageSize: number) => any;
  select: (condition: any) => any[];
  update: (condition: any, data: any) => void;
  delete: (condition: any) => void;
  insert: (data: any) => void;
}

// 本地文件数据源（内嵌式微型数据库）
export class LocalFileSource<T> implements IDataSource {
  constructor(public data: any) {}

  selectPage(condition: any, page = 1, pageSize = 10) {
    const result: T[] = [];
    this.data.forEach((v: any) => {
      for (const key in condition) {
        const dataValue = v[key];
        const targetValue = condition[key];
        if (targetValue[0] == "%") {
          if (targetValue != null && !dataValue.includes(targetValue.slice(1, targetValue.length - 1))) return false;
        } else {
          if (targetValue != null && targetValue !== dataValue) return false;
        }
      }
      result.push(v);
    });
    return this.page(result, page, pageSize);
  }

  page(data: T[], page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let size = data.length;
    let maxPage = 0;
    while (size > 0) {
      size -= pageSize;
      maxPage++;
    }
    return {
      page,
      pageSize,
      maxPage,
      data: data.slice(start, end)
    };
  }

  select(condition: any): any[] {
    return null;
  }
  update(condition: any, data: any) {}
  delete(condition: any) {}
  insert(data: any) {}
}

// 供给路由层使用的统一数据查询接口
export class QueryWrapper {
  constructor(public dataSource: IDataSource) {}

  selectPage(condition: any, page = 1, pageSize = 10) {
    return this.dataSource.selectPage(condition, page, pageSize);
  }
}
