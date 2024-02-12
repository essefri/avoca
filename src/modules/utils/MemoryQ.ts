import { QueueError } from '../../errors/QueueError';
import { MaxQueueSizeError } from '../../errors/mega/MaxQueueSizeError';
import { EventEmitter } from 'events';
import { Test } from './Test';

type Job<T> = (...args: Array<any>) => T;

interface QueueItem<T> {
  id: Symbol;
  timeout: NodeJS.Timeout;
  callback: Job<T>;
}

export class MemoryQ<T> extends EventEmitter {
  private MaxQueueTime: number;

  private maxQueueSize: number;

  private queue: Array<QueueItem<T>> = [];

  constructor(MaxQueueTime: number, maxQueueSize: number) {
    super();

    if (
      !(Test.isInteger(MaxQueueTime) && Test.isGreaterThan(MaxQueueTime, 0))
    ) {
      throw new QueueError(
        `The 'MaxQueueTime' must be an integer greater than 0`
      );
    }

    if (
      !(Test.isInteger(maxQueueSize) && Test.isGreaterThan(maxQueueSize, 0)) &&
      !Test.isInfinity(maxQueueSize)
    ) {
      throw new QueueError(
        `The 'maxQueueSize' must be an integer greater than 0`
      );
    }

    this.MaxQueueTime = MaxQueueTime;
    this.maxQueueSize = maxQueueSize;
  }

  public getMaxQueueTime() {
    return this.MaxQueueTime;
  }

  public getMaxQueueSize(): number {
    return this.maxQueueSize;
  }

  public size() {
    return this.queue.length;
  }

  public hasJob(): boolean {
    return this.size() > 0;
  }

  public hasNoJob(): boolean {
    return this.size() === 0;
  }

  private shouldPut(): boolean {
    return this.maxQueueSize === +Infinity || this.maxQueueSize > this.size();
  }

  public put(job: Job<T>): void {
    if (!Test.isFunction(job)) {
      throw new QueueError(`The 'job' argument must be a function`);
    }

    if (!this.shouldPut()) {
      throw new MaxQueueSizeError('Queue is full');
    }

    const id = Symbol();

    const callback = () => {
      // find the job
      const job = this.queue.find((job) => job.id === id);

      // remove it
      this.queue = this.queue.filter((job) => job.id !== id);

      // access the job using this event
      this.emit('MaxQueueTime', job.callback);
    };

    const timeout = setTimeout(callback, this.MaxQueueTime);

    this.queue.unshift({
      id,
      timeout,
      callback: job,
    });
  }

  public pull(): Job<T> | null {
    const job = this.queue.pop();
    if (Test.isUndefined(job)) return null;

    clearTimeout(job.timeout);
    return job.callback;
  }

  public batch(): Array<Job<T>> | null {
    const jobs: Array<Job<T>> = [];

    let job;

    while ((job = this.pull()) !== null) {
      jobs.push(job);
    }

    return jobs.length > 0 ? jobs : null;
  }
}
