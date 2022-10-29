// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import path from "path";
import fs from "fs-extra";
import axios from "axios";
import { pipeline, Readable } from "stream";
import logger from "./log";

export function downloadFileToLocalFile(url: string, localFilePath: string): Promise<boolean> {
  logger.info(`Download File: ${url} --> ${path.normalize(localFilePath)}`);
  return new Promise(async (resolve, reject) => {
    try {
      const writeStream = fs.createWriteStream(path.normalize(localFilePath));
      const response = await axios<Readable>({
        url,
        responseType: "stream"
      });
      pipeline(response.data, writeStream, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
