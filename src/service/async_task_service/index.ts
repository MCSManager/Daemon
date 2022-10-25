// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import EventEmitter from "events";
import logger from "../log";
export interface IAsyncTaskJSON {
  [key: string]: any;
}

export interface IAsyncTask extends EventEmitter {
  // The taskId must be complex enough to prevent other users from accessing the information
  taskId: string;
  type: string;
  start(): Promise<boolean | void>;
  stop(): Promise<boolean | void>;
  status(): number;
  toObject(): IAsyncTaskJSON;
}

export abstract class AsyncTask extends EventEmitter implements IAsyncTask {
  constructor() {
    super();
  }

  public taskId: string;
  public type: string;

  // 0=stop 1=running -1=error 2=downloading
  protected _status = 0;

  public start() {
    return this.onStarted();
  }
  public stop() {
    this.emit("stopped");
    return this.onStopped();
  }
  public error(err: any) {
    logger.error(`AsyncTask - ID: ${this.taskId} TYPE: ${this.type} Error:`, err);
    this.emit("error", err);
    this.stop();
  }

  status(): number {
    return this._status;
  }

  abstract onStarted(): Promise<boolean | void>;
  abstract onStopped(): Promise<boolean | void>;
  abstract onError(): void;
  abstract toObject(): IAsyncTaskJSON;
}

export class TaskCenter {
  public static tasks = new Array<IAsyncTask>();

  public static addTask(t: IAsyncTask) {
    TaskCenter.tasks.push(t);
    t.start();
    t.on("stopped", () => TaskCenter.onTaskStopped(t));
    t.on("error", () => TaskCenter.onTaskError(t));
  }

  public static onTaskStopped(t: IAsyncTask) {
    logger.info("Async Task:", t.taskId, "Stopped.");
  }

  public static onTaskError(t: IAsyncTask) {
    logger.info("Async Task:", t.taskId, "Failed.");
  }

  public static getTask(taskId: string, type?: string) {
    for (const iterator of TaskCenter.tasks) {
      if (iterator.taskId === taskId && (type == null || iterator.type === type)) return iterator;
    }
  }

  public static getTasks(taskId: string, type?: string) {
    const result: IAsyncTask[] = [];
    for (const iterator of TaskCenter.tasks) {
      if (iterator.taskId === taskId && (type == null || iterator.type === type)) {
        result.push(iterator);
      }
    }
    return result;
  }
}
