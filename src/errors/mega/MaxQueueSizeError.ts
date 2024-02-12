export class MaxQueueSizeError extends Error {
  constructor(message?: string) {
    super(message ? message : `The max number of jobs has been reached`);
    this.name = 'MaxQueueSizeError';
  }
}
