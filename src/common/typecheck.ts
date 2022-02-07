/*
  Copyright (C) 2022 Suwings <Suwings@outlook.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  According to the AGPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings <Suwings@outlook.com>

  该程序是免费软件，您可以重新分发和/或修改据 GNU Affero 通用公共许可证的条款，
  由自由软件基金会，许可证的第 3 版，或（由您选择）任何更高版本。

  根据 AGPL 与用户协议，您必须保留所有版权声明，如果修改源代码则必须开源修改后的源代码。
  可以前往 https://mcsmanager.com/ 阅读用户协议，申请闭源开发授权等。
*/

export function configureEntityParams(self: any, args: any, key: string, typeFn?: Function): any {
  const selfDefaultValue = self[key] ?? null;
  const v = args[key] != null ? args[key] : selfDefaultValue;

  if (typeFn === Number) {
    if (v === "" || v == null) {
      self[key] = null;
    } else {
      if (isNaN(Number(v))) throw new Error(`ConfigureEntityParams Error: Expected type to be Number, but got ${typeof v}`);
      self[key] = Number(v);
    }
    return;
  }

  if (typeFn === String) {
    if (v == null) {
      self[key] = null;
    } else {
      self[key] = String(v);
    }
    return;
  }

  if (typeFn === Boolean) {
    if (v == null) {
      self[key] = false;
    } else {
      self[key] = Boolean(v);
    }
    return;
  }

  if (typeFn === Array) {
    if (v == null) return (self[key] = null);
    if (!(v instanceof Array)) throw new Error(`ConfigureEntityParams Error: Expected type to be Array, but got ${typeof v}`);
    return;
  }

  // 最后处理
  if (typeFn) {
    self[key] = typeFn(v);
  } else {
    self[key] = v;
  }
}
