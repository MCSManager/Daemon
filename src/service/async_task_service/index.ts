import EventEmitter from "events";

export interface IAsyncTaskJSON {
  [key: string]: any;
}

export interface IAsyncTask extends EventEmitter {
  uid: string;
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
    console.log("Task:", t.uid, "Stopped");
  }

  public static onTaskFailure(t: IAsyncTask) {
    console.log("Task:", t.uid, "Failed");
  }

  public static getTask(uid: string) {
    for (const iterator of TaskCenter.tasks) {
      if (iterator.uid === uid) return iterator;
    }
  }
}
