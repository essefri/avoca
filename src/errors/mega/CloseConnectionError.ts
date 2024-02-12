export class CloseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloseConnectionError';
  }
}
