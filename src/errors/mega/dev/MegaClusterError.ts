export class MegaClusterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MegaClusterError';
  }
}
