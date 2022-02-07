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
