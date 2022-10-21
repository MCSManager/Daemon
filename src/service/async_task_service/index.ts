import EventEmitter from "events";
import logger from "../log";

export interface IAsyncTaskJSON {
  [key: string]: any;
}

export interface IAsyncTask extends EventEmitter {
  // The taskId must be complex enough to prevent other users from accessing the information
  taskId: string;
  start(): Promise<boolean | void>;
  stop(): Promise<boolean | void>;
  status(): number;
  toObject(): IAsyncTaskJSON;
}

export class TaskCenter {
  public static tasks = new Array<IAsyncTask>();
  public static addTask(t: IAsyncTask) {
    TaskCenter.tasks.push(t);
    t.start();
    t.on("stopped", () => TaskCenter.onTaskStopped(t));
    t.on("failure", () => TaskCenter.onTaskFailure(t));
  }

  public static onTaskStopped(t: IAsyncTask) {
    logger.info("Async Task:", t.taskId, "Stopped.");
  }

  public static onTaskFailure(t: IAsyncTask) {
    logger.info("Async Task:", t.taskId, "Failed.");
  }

  public static getTask(taskId: string) {
    for (const iterator of TaskCenter.tasks) {
      if (iterator.taskId === taskId) return iterator;
    }
  }
}
