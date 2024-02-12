export class CreateConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateConnectionError';
  }
}
