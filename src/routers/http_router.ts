/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-07-14 16:13:18
 * @LastEditTime: 2021-07-15 17:44:59
 * @Description:
 */
import Router from "@koa/router";
import fs from "fs-extra";
import path from "path";
import { missionPassport } from "../service/mission_passport";
import InstanceSubsystem from "../service/system_instance";
import FileManager from "../service/system_file";

const router = new Router();

// 定义 HTTP 首页展示路由
router.all("/", async (ctx) => {
  ctx.body = "MCSManager Deamon: Copyright(c) 2021 Suwings | Status: OK.";
  ctx.status = 200;
});

// 文件下载路由
router.get("/download/:key", async (ctx) => {
  try {
    const key = ctx.params.key;
    // 从任务中心取任务
    const mission = missionPassport.getMission(key, "download");
    if (!mission) return (ctx.body = "No task, Access denied | 无下载任务，非法访问");
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) {
      missionPassport.deleteMission(key);
      return (ctx.body = "Access denied | 实例不存在");
    }
    const cwd = instance.config.cwd;
    const target = path.join(cwd, mission.parameter.fileName);
    const ext = path.extname(target);
    // 检查文件跨目录安全隐患
    const fileManager = new FileManager(cwd);
    if (!fileManager.check(target)) {
      missionPassport.deleteMission(key);
      return (ctx.body = "Access denied | 参数不正确");
    }
    // 开始给用户下载文件
    ctx.type = ext;
    ctx.body = fs.createReadStream(target);
    // 任务已执行，销毁护照
    missionPassport.deleteMission(key);
  } catch (error) {
    ctx.body = `下载出错: ${error.message}`;
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
