export class MegaPoolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MegaPoolError';
  }
}
