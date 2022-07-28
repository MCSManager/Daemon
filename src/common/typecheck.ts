// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

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
