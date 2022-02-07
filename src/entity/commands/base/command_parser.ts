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

export function commandStringToArray(cmd: string) {
  const QUOTES_KEY = "{quotes}";
  let start = 0;
  let len = cmd.length;
  const cmdArray: string[] = [];
  function _analyze() {
    for (let index = start; index < len; index++) {
      const ch = cmd[index];
      if (ch === " ") {
        findSpace(index);
        start++;
        continue;
      }
      if (ch === '"') {
        index = findQuotes(index);
      }
      if (index + 1 >= len) {
        findEnd();
        break;
      }
    }
  }

  function findEnd() {
    return cmdArray.push(cmd.slice(start));
  }

  function findSpace(endPoint: number) {
    if (endPoint != start) {
      const elem = cmd.slice(start, endPoint);
      start = endPoint;
      return cmdArray.push(elem);
    }
  }

  function findQuotes(p: number) {
    for (let index = p + 1; index < len; index++) {
      const ch = cmd[index];
      if (ch === '"') return index;
    }
    throw new Error("错误的命令双引号，无法找到成对双引号，如需使用单个双引号请使用 {quotes} 符号");
  }

  _analyze();

  if (cmdArray.length == 0) {
    throw new Error("错误的命令长度，请确保命令格式正确");
  }

  for (const index in cmdArray) {
    const element = cmdArray[index];
    // 去掉最外层的双引号
    if (element[0] === '"' && element[element.length - 1] === '"') cmdArray[index] = element.slice(1, element.length - 1);
    // 分号替换回来
    while (cmdArray[index].indexOf(QUOTES_KEY) != -1) cmdArray[index] = cmdArray[index].replace(QUOTES_KEY, '"');
  }

  return cmdArray;
}
