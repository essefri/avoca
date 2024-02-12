export class TextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextError';
  }
}
