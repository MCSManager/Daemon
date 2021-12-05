/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2021-06-22 21:22:35
 * @LastEditTime: 2021-06-22 22:52:11
 * @Description: Test
 * @Projcet: MCSManager Daemon

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
