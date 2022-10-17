import { v4 } from "uuid";

export interface IQuickTask {
  uid: string;
  start(): void;
  stop(): void;
  status(): number;
}

export class QuickInstallTask implements IQuickTask {
  private _status = 0; // 0=stop 1=running
  public uid: string;

  constructor(public instanceName: string, public targetLink: string) {
    this.uid = v4();
  }

  start() {
    this._status = 1;
  }
  stop() {
    this._status = 0;
  }
  status(): number {
    return this._status;
  }
}

export class TaskCenter {
  public static tasks = new Array<IQuickTask>();
  public static addTask(t: IQuickTask) {
    TaskCenter.tasks.push(t);
  }
}

export function createQuickInstallTask(targetLink: string, instanceName: string) {
  const task = new QuickInstallTask("123", "adsdas");
  TaskCenter.addTask(task);
  return task;
}
