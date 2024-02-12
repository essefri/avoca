import { MegaPoolConnectionError } from "../../../errors/mega/dev/MegaPoolConnectionError";
import { QueryFailError } from "../../../errors/mega/QueryFailError";
import { _MegaConnection } from "../interfaces/_MegaConnection";
import { MegaPool } from "./MegaPool";
import { Test } from "../../utils/Test";

/**
 * Represents a connection instance returned by the MegaPol.request()
 */
export class MegaPoolConnection {
  public id: Symbol;

  /**
   * mega connection
   */
  private connection: _MegaConnection;

  /**
   * mega pool instnace created the connection
   */
  private pool: MegaPool;

  /**
   * creates a new MegaPoolConnection instance
   * @param connection
   * @param pool
   */
  constructor(connection: _MegaConnection, pool: MegaPool) {
    if (!this.isConnection(connection)) {
      throw new MegaPoolConnectionError(
        `The 'connection' argument must be a 'MegaConnection'`
      );
    }

    if (!this.isPool(pool)) {
      throw new MegaPoolConnectionError(
        `The 'pool' argument must be an instance of 'MegaPool'`
      );
    }

    this.connection = connection;
    this.pool = pool;
    this.id = connection.id;
  }

  private isConnection(connection: _MegaConnection): boolean {
    return (
      Test.isObject(connection) &&
      Test.areFunctions(connection.close, connection.isAlive, connection.query)
    );
  }

  private isPool(pool: MegaPool): boolean {
    return (
      Test.isObject(pool) &&
      Test.areFunctions(pool.emit, pool.request, pool.shutdown, pool.query)
    );
  }

  public release() {
    this.pool.release(this);
    this.connection = null;
    this.pool = null;

    this.query = () =>
      Promise.reject(
        new MegaPoolConnectionError(
          `Can't perform any farther operations after releasing the connection`
        )
      );
    this.release = () =>
      new MegaPoolConnectionError(
        `Can't perform any farther operations after releasing the connection`
      );
  }

  public query<T>(sql: string, values?: Array<any>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.connection
        .query(sql, values)
        .then((data) => {
          this.pool.emit("QuerySuccess", data);
          resolve(data as T);
        })
        .catch((error) => {
          const message =
            Test.isChildOf(error, Error) && Test.isText(error.message)
              ? error.message
              : "Query execution failed";
          error = new QueryFailError(message);
          this.pool.emit("QueryFail", message);
          this.pool.setError(error);
          reject(error);
        });
    });
  }
}
