/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-07-14 16:13:18
 * @LastEditTime: 2021-07-14 17:30:21
 * @Description:
 */
import Router from "@koa/router";
import fs from "fs-extra";
import path from "path";

const router = new Router();

// 定义 HTTP 首页展示路由
router.all("/", async (ctx) => {
  ctx.body = "Copyright(c) 2021 MCSManager | Status: OK.";
  ctx.status = 200;
});

// 文件下载路由
router.get("/download/:id/:name", async (ctx) => {
  try {
    const target = "D:/文件上传/test.zip";
    const ext = path.extname(target);
    ctx.type = ext;
    console.log("正在下载:", ext);
    ctx.body = fs.createReadStream(target);
  } catch (error) {
    ctx.body = "ERROR";
    ctx.status = 500;
  }
});

// 文件上载路由
router.post("/upload/:id", async (ctx) => {
  try {
    const file = ctx.request.files.file as any;
    if (file) {
      // 确认文件夹名和后缀
      const fullFileName = file.name as string;
      const fullFileNameArray = fullFileName.split(".");
      const ext = fullFileNameArray.pop() || "";
      const fileName = fullFileNameArray.join(".");
      const fileSavePath = `upload/${fileName}.${ext}`;

      // 特殊字符过滤
      const blackKeys = ["/", "\\", "|", "?", "*", ">", "<", ";", '"', "'"];
      for (const ch of blackKeys) if (fileName.includes(ch)) throw new Error("0x044");

      // 将文件从临时文件夹复制到指定目录
      const reader = fs.createReadStream(file.path);
      const upStream = fs.createWriteStream(fileSavePath);
      reader.pipe(upStream);
    }
  } catch (error) {
    ctx.body = "ERROR";
    ctx.status = 500;
  }
  ctx.body = "OK";
});

export default router;
