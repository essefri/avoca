export class EchoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EchoError';
  }
}
