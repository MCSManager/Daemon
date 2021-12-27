/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。
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
