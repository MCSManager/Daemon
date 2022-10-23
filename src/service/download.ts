// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import path from "path";
import fs from "fs-extra";
import axios from "axios";
import { pipeline, Readable } from "stream";

export function downloadFileToLocalFile(url: string, localFilePath: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
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
  });
}
