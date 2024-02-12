import { MySQLConnection } from '../MySQLConnection';

export class MySQLDriver {
  createConnection: jest.Mock = jest.fn(() =>
    Promise.resolve(new MySQLConnection({} as any))
  );
}
