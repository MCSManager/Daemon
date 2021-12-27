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

import { describe, it } from "mocha";
import assert from "assert";
import FileManager from "../service/system_file";

describe("File management directory permissions", () => {
  const filemanager = new FileManager(process.cwd() + "/test_file");
  console.log(`[DEBUG] ABS_PATH: ${filemanager.topPath}`);

  describe("#checkPath()", () => {
    it("should return true", function () {
      assert.strictEqual(filemanager.checkPath("aaa"), true);
      assert.strictEqual(filemanager.checkPath("aaa/xzxzx"), true);
      assert.strictEqual(filemanager.checkPath("./xxxxx"), true);
      assert.strictEqual(filemanager.checkPath("./xxxxx/zzzz zz z/xxxxx xx /sssss"), true);
      assert.strictEqual(filemanager.checkPath("./xxxxx.txt"), true);
    });

    it("should return false", function () {
      assert.strictEqual(filemanager.checkPath("../a.txt"), false);
      assert.strictEqual(filemanager.checkPath("../"), false);
      assert.strictEqual(filemanager.checkPath("../..//"), false);
      assert.strictEqual(filemanager.checkPath("../xxxx/aaa"), false);
      assert.strictEqual(filemanager.checkPath("../../xxxx/aaa"), false);
    });

    it("Test file cwd", async () => {
      // filemanager.cd("test_file");
      console.log(`CWD IS: ${filemanager.cwd}`);
      assert.notStrictEqual(await filemanager.readFile("abc.txt"), "");
      assert.strictEqual(await filemanager.readFile("abc.txt"), "测试文件 123 ABC 哈哈");
      filemanager.cd("Test dir 1");
      console.log(`CWD IS: ${filemanager.cwd}`);
      assert.strictEqual(await filemanager.readFile("hello.txt"), "TEST_TEXT_TEST[][][][]\r\nTEST_TEXT_TEST");
      filemanager.cd("../Test dir 1");
      console.log(`CWD IS: ${filemanager.cwd}`);
      assert.strictEqual(await filemanager.readFile("hello.txt"), "TEST_TEXT_TEST[][][][]\r\nTEST_TEXT_TEST");
      filemanager.cd("../");
      console.log(`CWD IS: ${filemanager.cwd}`);
      assert.strictEqual(await filemanager.readFile("abc.txt"), "测试文件 123 ABC 哈哈");
      filemanager.cd("Test dir 1/Last/");
      console.log(`CWD IS: ${filemanager.cwd}`);
      assert.strictEqual(await filemanager.readFile("OK.txt"), "OKOKOK");
      assert.strictEqual(await filemanager.readFile("../hello.txt"), "TEST_TEXT_TEST[][][][]\r\nTEST_TEXT_TEST");
      assert.strictEqual(await filemanager.readFile("../../abc.txt"), "测试文件 123 ABC 哈哈");
      // assert.strictEqual(await filemanager.readFile("../../../../abc.txt"), "测试文件 123 ABC 哈哈");
      filemanager.cd("../");
      console.log("filemanager.list()", `CWD IS: ${filemanager.cwd}`);
      // console.log("filemanager.list():", filemanager.list())
    });
  });
});
