// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../i18n";
import Router from "@koa/router";
import fs from "fs-extra";
import path from "path";
import { missionPassport } from "../service/mission_passport";
import InstanceSubsystem from "../service/system_instance";
import FileManager from "../service/system_file";

const router = new Router();

// Define the HTTP home page display route
router.all("/", async (ctx) => {
  ctx.body = "[MCSManager Daemon] Status: OK | reference: https://mcsmanager.com/";
  ctx.status = 200;
});

// file download route
router.get("/download/:key/:fileName", async (ctx) => {
  const key = ctx.params.key;
  const paramsFileName = ctx.params.fileName;
  try {
    // Get the task from the task center
    const mission = missionPassport.getMission(key, "download");
    if (!mission) throw new Error((ctx.body = "No task, Access denied"));
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error($t("http_router.instanceNotExist"));
    if (!FileManager.checkFileName(paramsFileName)) throw new Error($t("http_router.fileNameNotSpec"));

    const cwd = instance.config.cwd;
    const fileRelativePath = mission.parameter.fileName;
    const ext = path.extname(fileRelativePath);
    // Check for file cross-directory security risks
    const fileManager = new FileManager(cwd);
    if (!fileManager.check(fileRelativePath)) throw new Error((ctx.body = "Access denied,incorrect param"));

    // start downloading the file to the user
    ctx.response.set("Content-Disposition", `attachment; filename="${encodeURIComponent(paramsFileName)}"`);
    ctx.type = ext;
    ctx.body = fs.createReadStream(fileManager.toAbsolutePath(fileRelativePath));
    // The task has been executed, destroy the passport
    missionPassport.deleteMission(key);
  } catch (error) {
    ctx.body = $t("http_router.downloadErr", { error: error.message });
    ctx.status = 500;
  } finally {
    missionPassport.deleteMission(key);
  }
});

// file upload route
router.post("/upload/:key", async (ctx) => {
  const key = ctx.params.key;
  const unzip = ctx.query.unzip;
  const zipCode = String(ctx.query.code);
  try {
    // Get the task & check the task & check if the instance exists
    const mission = missionPassport.getMission(key, "upload");
    if (!mission) throw new Error("Access denied 0x061");
    const instance = InstanceSubsystem.getInstance(mission.parameter.instanceUuid);
    if (!instance) throw new Error("Access denied 0x062");
    const uploadDir = mission.parameter.uploadDir;
    const cwd = instance.config.cwd;

    const file = ctx.request.files.file as any;
    if (file) {
      // Confirm storage location
      const fullFileName = file.name as string;
      const fileSaveRelativePath = path.normalize(path.join(uploadDir, fullFileName));

      // File name special character filtering (to prevent any cross-directory intrusion)
      if (!FileManager.checkFileName(fullFileName)) throw new Error("Access denied 0x063");

      // Check for file cross-directory security risks
      const fileManager = new FileManager(cwd);
      if (!fileManager.checkPath(fileSaveRelativePath)) throw new Error("Access denied 0x064");
      const fileSaveAbsolutePath = fileManager.toAbsolutePath(fileSaveRelativePath);

      // prohibit overwriting the original file
      // if (fs.existsSync(fileSaveAbsolutePath)) throw new Error("The file exists and cannot be overwritten");

      // Copy the file from the temporary folder to the specified directory
      const reader = fs.createReadStream(file.path);
      const upStream = fs.createWriteStream(fileSaveAbsolutePath);
      reader.pipe(upStream);
      reader.on("close", () => {
        if (unzip) {
          // If decompression is required, perform the decompression task
          const filemanager = new FileManager(instance.config.cwd);
          filemanager.unzip(fullFileName, "", zipCode);
        }
      });
      return (ctx.body = "OK");
    }
    ctx.body = $t("http_router.updateErr");
    ctx.status = 500;
  } catch (error) {
    ctx.body = error.message;
    ctx.status = 500;
  } finally {
    missionPassport.deleteMission(key);
  }
});

export default router;
