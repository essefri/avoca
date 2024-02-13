import { MegaPoolConnectionError } from "../../../errors/mega/dev/MegaPoolConnectionError";
import { QueryFailError } from "../../../errors/mega/QueryFailError";
import { _MegaConnection } from "../interfaces/_MegaConnection";
import { MegaPool } from "./MegaPool";
import { Test } from "../../utils/Test";
import { MySQLConnection } from "../drivers/MySQL/MySQLConnection";

/**
 * Represents a connection instance returned by the MegaPol.request()
 */
export class MegaPoolConnection {
  // Stores the _MegaConnection.id
  public id: Symbol;

  // The _MegaConnection instance
  private connection: _MegaConnection;

  // MegaPool instance
  private pool: MegaPool;

  /**
   * creates a new MegaPoolConnection instance
   * @param connection Valid _MegaConnection like (MySQLConnection,SQLiteConnection)...
   * @param pool MegaPool instance the MegaPoolConnection belongs to
   */
  constructor(connection: _MegaConnection, pool: MegaPool) {
    // add more _MegaConnection checks as you go
    if (!Test.isChildOf(connection, MySQLConnection)) {
      throw new MegaPoolConnectionError(
        `The 'connection' argument must be a 'MegaConnection'`
      );
    }

    // pool must be an instance of MegaPool
    if (!Test.isChildOf(pool, MegaPool)) {
      throw new MegaPoolConnectionError(
        `The 'pool' argument must be an instance of 'MegaPool'`
      );
    }

    // private props
    this.connection = connection;
    this.pool = pool;

    // public prop
    this.id = connection.id;
  }

  /**
   * Returns the given error message or a default message
   * @param error The Error instance
   */
  private getMessage(error: Error): string {
    return Test.isChildOf(error, Error) && Test.isText(error.message)
      ? error.message
      : "Query execution failed";
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
    this.release = () => {
      throw new MegaPoolConnectionError(
        `Can't perform any farther operations after releasing the connection`
      );
    };
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
          // emit QuerySuccess event with data
          this.pool.emit("QuerySuccess", data);

          // resolve with data
          resolve(data as T);
        })
        .catch((error: Error) => {
          console.log("simo");
          // emit a QueryFail event with a QueryFailError
          const queryFailError = new QueryFailError(this.getMessage(error));
          this.pool.emit("QueryFail", queryFailError);

          // register the QueryFailError in the pool
          this.pool.setError(queryFailError);

          // reject withe QueryFailError
          return reject(queryFailError);
        });
    });
  }
}
