export class MegaConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MegaConnectionError';
  }
}
