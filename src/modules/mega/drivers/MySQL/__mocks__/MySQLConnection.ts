import { Connection } from "mysql2/promise";
import { _MegaConnection } from "../../../interfaces/_MegaConnection";
import { CreateConnectionError } from "../../../../../errors/mega/CreateConnectionError";
import { Test } from "../../../../utils/Test";
import { MySQLConnectionError } from "../../../../../errors/mega/drivers/MySQLConnectionError";

export class MySQLConnection implements _MegaConnection {
  public id: Symbol;

  public isAlive: jest.Mock;
  public close: jest.Mock;
  public query: jest.Mock;

  constructor(connection: Connection) {
    this.id = Symbol("MySQL connection id");

    this.isAlive = jest.fn(() => Promise.resolve());
    this.close = jest.fn(() => Promise.resolve());
    this.query = jest.fn(() => Promise.resolve());
  }
}
