export class StackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StackError';
  }
}
