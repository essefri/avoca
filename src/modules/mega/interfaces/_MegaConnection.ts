export interface _MegaConnection {
  id: Symbol;
  query<T>(sql: string, values?: Array<any>): Promise<T>;
  close(): Promise<void>;
  isAlive(): Promise<void>;
}
