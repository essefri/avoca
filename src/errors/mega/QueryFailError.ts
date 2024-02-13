export class QueryFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryFailError";
  }
}
