export class MySQLConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MySQLConnectionError';
  }
}
