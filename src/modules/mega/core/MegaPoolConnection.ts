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

  /**
   * Tells if the given connection is a valid _MegaConnection
   * @param connection The connection to check
   * @returns Boolean true if the connection is a valid connection instance
   */
  private isConnection(connection: _MegaConnection): boolean {
    return (
      Test.isObject(connection) &&
      Test.areFunctions(connection.close, connection.isAlive, connection.query)
    );
  }

  /**
   * Tells if the given pool is a valid MegaPool
   * @param pool The pool to check
   * @returns Boolean true if the pool is a valid pool instance
   */
  private isPool(pool: MegaPool): boolean {
    return (
      Test.isObject(pool) &&
      Test.areFunctions(pool.emit, pool.request, pool.shutdown, pool.query)
    );
  }

  /**
   * Releases the connection
   */
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

  /**
   * Execute the qiven sql query
   * @param sql The sql string to execute
   * @param values The values of the params defined in the sql string
   * @returns Expected result
   */
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
