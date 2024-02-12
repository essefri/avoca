export class MaxConnectionError extends Error {
  constructor(message?: string) {
    super(message ? message : `The max number of connections has been reached`);
    this.name = 'MaxConnectionError';
  }
}
