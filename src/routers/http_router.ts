/*
 * @Author: Copyright 2021 Suwings
 * @Date: 2021-07-14 16:13:18
 * @LastEditTime: 2021-07-15 22:08:43
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
router.get("/download/:key/:fileName", async (ctx) => {
  const key = ctx.params.key;
  try {
    // 从任务中心取任务
    const mission = missionPassport.getMission(key, "download");
    if (!mission) throw new Error(ctx.body = "No task, Access denied | 无下载任务，非法访问");
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error("实例不存在");

    const cwd = instance.config.cwd;
    const fileRelativePath = mission.parameter.fileName;
    const ext = path.extname(fileRelativePath);
    // 检查文件跨目录安全隐患
    const fileManager = new FileManager(cwd);
    if (!fileManager.check(fileRelativePath)) throw new Error(ctx.body = "Access denied | 参数不正确");

    // 开始给用户下载文件
    ctx.type = ext;
    ctx.body = fs.createReadStream(fileManager.toAbsolutePath(fileRelativePath));
    // 任务已执行，销毁护照
    missionPassport.deleteMission(key);
  } catch (error) {
    ctx.body = `下载出错: ${error.message}`;
    ctx.status = 500;
  } finally {
    missionPassport.deleteMission(key);
  }
});

// 文件上载路由
router.post("/upload/:key", async (ctx) => {
  const key = ctx.params.key;
  try {
    // 领取任务 & 检查任务 & 检查实例是否存在
    const mission = missionPassport.getMission(key, "upload");
    if (!mission) throw new Error("Access denied 0x061");
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error("Access denied 0x062");
    const uploadDir = mission.parameter.uploadDir;
    const cwd = instance.config.cwd;

    const file = ctx.request.files.file as any;
    if (file) {
      // 确认存储位置
      const fullFileName = file.name as string;
      const fileSaveRelativePath = path.normalize(path.join(uploadDir, fullFileName));

      // 文件名特殊字符过滤(杜绝任何跨目录入侵手段)
      if (!FileManager.checkFileName(fullFileName)) throw new Error("Access denied 0x063");

      // 检查文件跨目录安全隐患
      const fileManager = new FileManager(cwd);
      if (!fileManager.checkPath(fileSaveRelativePath)) throw new Error("Access denied 0x064");
      const fileSaveAbsolutePath = fileManager.toAbsolutePath(fileSaveRelativePath)

      // 禁止覆盖原文件
      if (fs.existsSync(fileSaveAbsolutePath)) throw new Error("文件存在，无法覆盖");

      // 将文件从临时文件夹复制到指定目录
      const reader = fs.createReadStream(file.path);
      const upStream = fs.createWriteStream(fileSaveAbsolutePath);
      reader.pipe(upStream);
      return ctx.body = "OK";
    }
    ctx.body = "未知原因: 上传失败";
  } catch (error) {
    ctx.body = error.message;
    ctx.status = 500;
  } finally {
    missionPassport.deleteMission(key);
  }
});

export default router;
