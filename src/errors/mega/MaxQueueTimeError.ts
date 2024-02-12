export class MaxQueueTimeError extends Error {
  constructor(message?: string) {
    super(message ? message : `Job max time has been reached`);
    this.name = 'MaxQueueTimeError';
  }
}
