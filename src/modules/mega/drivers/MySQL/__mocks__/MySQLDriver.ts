import { MySQLConnection } from "../MySQLConnection";
import { _MySQLOptions } from "../../../types/_MySQLOptions";
import { _MegaDriver } from "../../../interfaces/_MegaDriver";

export class MySQLDriver implements _MegaDriver {
  public createConnection: jest.Mock;

  constructor() {
    this.createConnection = jest.fn(() =>
      Promise.resolve(new MySQLConnection(undefined))
    );
  }
}
