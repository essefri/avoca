import { EventEmitter } from "events";

import { _MegaDriver } from "../interfaces/_MegaDriver";
import { _MegaConnection } from "../interfaces/_MegaConnection";
import { _MegaPoolOptions } from "../types/_MegaPoolOptions";
import { _MegaConnectionOptions } from "../types/_MegaConnectionOptions";

import { MySQLDriver } from "../drivers/MySQL/MySQLDriver";
import { MegaPoolConnection } from "./MegaPoolConnection";

import { MemoryQ } from "../../utils/MemoryQ";
import { Echo } from "../../utils/Echo";
import { Test } from "../../utils/Test";

import { CloseConnectionError } from "../../../errors/mega/CloseConnectionError";
import { CreateConnectionError } from "../../../errors/mega/CreateConnectionError";
import { MaxConnectionError } from "../../../errors/mega/MaxConnectionError";
import { MegaPoolError } from "../../../errors/mega/dev/MegaPoolError";
import { MaxQueueTimeError } from "../../../errors/mega/MaxQueueTimeError";
import { MaxQueueSizeError } from "../../../errors/mega/MaxQueueSizeError";
import { PoolOptions } from "mysql2";

export type PoolError = {
  id: Symbol;
  name: string;
  message: string;
  timestamp: Date;
};

/**
 * @event CreateSuccess Emitted when the connection creation succeeds with the created connection.
 * @param {MegaPoolConnection} connection - The successfully created connection.
 */

/**
 * @event CreateFail Emitted when the connection creation fails.
 * @param {string} message - The error message indicating the reason for the failure.
 */

/**
 * @event CloseSuccess Emitted when the connection closure succeeds.
 */

/**
 * @event CloseFail Emitted when the connection closure fails.
 * @param {_MegaConnection} connection - The connection could not be closed.
 * @param {string} message - The error message indicating the reason for the failure.
 */

/**
 * @event QuerySuccess Emitted when a query execution succeeds with the resulting data.
 * @param {any} data - The data resulting from the successful query execution.
 */

/**
 * @event QueryFail Emitted when a query execution fails.
 * @param {string} message - The error message indicating the reason for the query failure.
 */

/**
 * Connections pooling interface manages connection creation and closing for you
 * @method request() resolves with a MegaPoolConnection instance
 *
 */
export class MegaPool extends EventEmitter {
  /**
   * The pool identifier
   */
  private id: Symbol;

  /**
   * The pool errors
   */
  private errors: Array<PoolError>;

  /**
   * The connections in use
   */
  private acquiredConnections: Array<_MegaConnection>;

  /**
   * The connections free to use
   */
  private idleConnectionQ: MemoryQ<_MegaConnection>;

  /**
   * The queue of connection requests
   */
  private connectionRequestQ: MemoryQ<void>;

  /**
   * The connection configuration options
   */
  private connectionOptions: _MegaConnectionOptions;

  /**
   * The pool configuration options
   */
  private poolOptions: _MegaPoolOptions;

  /**
   * The driver we use to create the connection
   */
  private driver: _MegaDriver;

  /**
   * Creates a new instance of MegaPool
   * @param connectionOptions Connection configuration options
   * @param poolOptions Pool configuration options
   * @param driver Instance of _MegaDriver
   */
  constructor(
    connectionOptions: _MegaConnectionOptions,
    poolOptions?: _MegaPoolOptions,
    driver?: _MegaDriver
  ) {
    super();

    this.setConnectionOptions(connectionOptions);
    this.setPoolOptions(poolOptions);
    this.setDriver(driver);

    this.id = Symbol("pool id");
    this.acquiredConnections = [];
    this.errors = new Array();

    this.idleConnectionQ = new MemoryQ(this.poolOptions.maxIdleTime, Infinity);

    this.connectionRequestQ = new MemoryQ(
      this.poolOptions.maxQueueTime,
      this.poolOptions.maxQueueSize
    );

    // close timed out idle connection
    this.idleConnectionQ.on("MaxQueueTime", (job) => {
      // close the idle connection and catch CloseConnectionError
      this.closeConnection(job()).catch((error) => {
        // console.log(error.message);
      });
    });

    // reject timed out connection requests
    this.connectionRequestQ.on("MaxQueueTime", (job) => job());
  }

  /**
   * Validate the given options and initialize the pool options
   * @param options The pool options
   */
  private setPoolOptions(options: _MegaPoolOptions): void {
    if (Test.isUndefined(options)) {
      this.poolOptions = {
        maxConnections: 10, // max number of connections
        maxIdleTime: 60000, // max number of miliseconds the connection can be idle
        shouldQueue: true, // should queue connection requests
        maxQueueSize: Infinity, // max number of requests to queue
        maxQueueTime: 1000, // max number of miliseconds a request can stay in the queue
        shouldRetry: true, // should retry connection creation and closing connections when they fail
        maxRetry: 3, // max number of times to retry the opertation
        retryDelay: 500, // number of miliseconds to wait before each retry attempt (3th after 1500)
        extraDelay: 500, // number of miliseoncds to add after each delay
      };

      return;
    }

    if (!Test.isObject(options)) {
      throw new MegaPoolError(`The 'poolOptions' argument must be an object`);
    }

    if (
      !Test.isInteger(options.maxConnections) ||
      !Test.isGreaterThan(options.maxConnections, 0)
    ) {
      options.maxConnections = 10;
    }

    if (
      !Test.isInteger(options.maxIdleTime) ||
      !Test.isGreaterThan(options.maxIdleTime, 0)
    ) {
      options.maxIdleTime = 60000; // 1min
    }

    if (!Test.isBoolean(options.shouldQueue)) {
      options.shouldQueue = true; // 1min
    }

    if (
      !Test.isInteger(options.maxQueueSize) ||
      !Test.isGreaterThan(options.maxQueueSize, 0)
    ) {
      options.maxQueueSize = Infinity;
    }

    if (
      !Test.isInteger(options.maxQueueTime) ||
      !Test.isGreaterThan(options.maxQueueTime, 0)
    ) {
      options.maxQueueTime = 1000; // 1s
    }

    if (!Test.isBoolean(options.shouldRetry)) {
      options.shouldRetry = true;
    }

    if (
      !Test.isInteger(options.maxRetry) ||
      !Test.isGreaterThan(options.maxRetry, 0)
    ) {
      options.maxRetry = 3;
    }

    if (
      !Test.isInteger(options.retryDelay) ||
      !Test.isGreaterThan(options.retryDelay, 0)
    ) {
      options.retryDelay = 500;
    }

    if (
      !Test.isInteger(options.extraDelay) ||
      !Test.isGreaterThanOrEqual(options.extraDelay, 0)
    ) {
      options.extraDelay = 500;
    }

    this.poolOptions = options;
  }

  /**
   * Validate the given options and initialize the connection options
   * @param options The connection options
   */
  private setConnectionOptions(options: _MegaConnectionOptions): void {
    if (!Test.isObject(options)) {
      throw new MegaPoolError(
        `The 'connectionOptions' argument must be an object`
      );
    }

    this.connectionOptions = options;
  }

  /**
   * Vaidate the given driver and initialize it
   * @param driver The driver to use to create connections
   */
  private setDriver(driver: _MegaDriver): void {
    if (Test.isUndefined(driver)) {
      this.driver = new MySQLDriver();
    } else if (Test.isChildOf(driver, MySQLDriver)) {
      this.driver = driver;
    }

    throw new MegaPoolError(
      `The 'driver' argument must be a valid mega driver`
    );
  }

  /**
   * Retry the given job
   * @param job The job function to execute
   * @returns Promise resolves with the job's return value
   */
  private retry<T>(job: () => T | Promise<T>): Promise<T> {
    Echo.setMaxRetry(this.poolOptions.maxRetry);
    Echo.setRetryDelay(this.poolOptions.retryDelay);
    Echo.setExtraDelay(this.poolOptions.extraDelay);
    return Echo.retry<T>(job);
  }

  /**
   * Is it still possible to create connections
   */
  private shouldCreate(): boolean {
    return (
      this.acquiredConnections.length + this.idleConnectionQ.size() <
      this.poolOptions.maxConnections
    );
  }

  /**
   * Is it possible to queue connections requests
   */
  private shouldQueue(): boolean {
    return this.poolOptions.shouldQueue;
  }

  /**
   * Is it possible to retry connections
   */
  private shouldRetry(): boolean {
    return this.poolOptions.shouldRetry;
  }

  /**
   * Close the given connection
   * @param connection The connection to be closed
   * @returns Promise resolves if the connection is closed successfully
   * @emits CloseFail when the creation fail
   * @emits CloseSuccess when the connection is closed successfully
   * @example
   * // handle closeFail event
   * this.on('closeFail',(message) => console.log(message))
   *
   * // handle CloseSuccess event
   * this.on('CloseSuccess',() => console.log('close cuccess'))
   */
  private closeConnection(connection: _MegaConnection): Promise<void> {
    return new Promise((resolve, reject) => {
      const getMessage = (error: any): string => {
        return Test.isError(error) && Test.isText(error.message)
          ? error.message
          : "Failed to close the connection";
      };

      const rejectAction = (message: string) => {
        this.emit("CloseFail", connection, message);
        const error = new CloseConnectionError(message);
        this.setError(error);
        reject(error);
      };

      connection
        .close()
        .then(() => {
          this.emit("CloseSuccess");
          resolve();
        })
        .catch((error) => {
          if (!this.shouldRetry()) return rejectAction(getMessage(error));
          this.retry<void>(() => connection.close())
            .then(() => resolve())
            .catch((error) => rejectAction(getMessage(error)));
        });
    });
  }

  /**
   * Create a new connection
   * @returns Promise resolves with the created connection
   * @emits CreateFail when the creation fail
   * @emits CreateSuccess when the connection is created successfully
   * @example
   * // handle createFail event
   * this.on('createFail',(message) => console.log(message))
   *
   * // handle createSuccess event
   * this.on('createSuccess',(connection) => console.log(connection))
   */
  private createConnection(): Promise<_MegaConnection> {
    return new Promise((resolve, reject) => {
      // creation faluire error message
      const parseMessage = (error: Error): string => {
        return Test.isError(error) && Test.isText(error.message)
          ? error.message
          : "Failed to create the connection";
      };

      // reject wwith error when the connection creation fail
      const rejectAction = (message: string) => {
        this.emit("CreateFail", message);
        const error = new CreateConnectionError(message);
        this.setError(error);
        reject(error);
      };

      const create = () => this.driver.createConnection(this.connectionOptions);

      create()
        .then((connection) => resolve(connection))
        .catch((error) => {
          if (!this.shouldRetry()) return rejectAction(parseMessage(error));

          this.retry<_MegaConnection>(create)
            .then((connection) => resolve(connection))
            .catch((error) => rejectAction(parseMessage(error)));
        });
    });
  }

  /**
   * Request a connection from the pool
   * @returns Promise resolves with a connection
   * @example
   * // create new pool
   * const pool = new MegaPool(connectionOptions)
   *
   * // request a connection
   * const connection = await pool.request()
   *
   * // execute queries
   * await connection.query(sql)
   * await connection.query(sql,values)
   *
   * // release the connection
   * connection.release()
   * pool.release(connection)
   */
  public request(): Promise<MegaPoolConnection> {
    return new Promise((resolve, reject) => {
      if (this.hasIdle()) {
        const connection = this.idleConnectionQ.pull()();

        return connection
          .isAlive()
          .then(() => {
            this.acquiredConnections.push(connection);
            resolve(new MegaPoolConnection(connection, this));
          })
          .catch(() => {
            return this.closeConnection(connection)
              .then(() => {
                return this.request()
                  .then((connection) => resolve(connection))
                  .catch((error) => reject(error));
              })
              .catch((error) => {
                return reject(error);
              });
          });
      }

      if (this.shouldCreate()) {
        return this.createConnection()
          .then((connection) => {
            // save the connection locally in the pool
            this.acquiredConnections.push(connection);
            // create a MegaPoolConnection
            const megaPoolConnection = new MegaPoolConnection(connection, this);
            this.emit("CreateSuccess", megaPoolConnection);
            resolve(megaPoolConnection);
          })
          .catch((error) => reject(error));
      }

      if (this.shouldQueue()) {
        if (this.connectionRequestQ.size() < this.poolOptions.maxQueueSize) {
          return this.connectionRequestQ.put((connection: _MegaConnection) => {
            if (Test.isDefined(connection)) {
              return resolve(new MegaPoolConnection(connection, this));
            }

            this.emit("MaxQueueTime");
            this.setError(new MaxQueueTimeError());
            reject(new MaxQueueTimeError());
          });
        }

        this.emit("MaxQueueSize");
        this.setError(new MaxQueueSizeError());
        reject(new MaxQueueSizeError());
        return;
      }

      this.emit("MaxConnection");
      this.setError(new MaxConnectionError());
      reject(new MaxConnectionError());
    });
  }

  /**
   * Release the given connection
   * @param connection Instance of MegaPoolConnection to release
   */
  public release(connection: MegaPoolConnection): void {
    if (!Test.isChildOf(connection, MegaPoolConnection)) {
      throw new MegaPoolError(
        "The connection must be instance of MegaPoolConnection"
      );
    }

    // if there are any connection requests
    if (this.connectionRequestQ.hasJob()) {
      const job = this.connectionRequestQ.pull();
      // resolve the request with the connectin
      return job(connection);
    }

    // register a new idle connection
    const con = this.acquiredConnections.find(
      (value: _MegaConnection) => value.id === connection.id
    );

    this.idleConnectionQ.put(() => con);
  }

  /**
   * Executes the given sql statement
   * @param sql The sql string
   * @param values The values of the params defined in the sql string
   * @returns The Expected result
   */
  public query<T>(sql: string, values?: Array<any>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.request()
        .then((connection) => {
          connection
            .query<T>(sql, values)
            .then((result) => {
              connection.release();
              resolve(result);
            })
            .catch((error) => {
              connection.release();
              reject(error);
            });
        })
        .catch((error) => reject(error));
    });
  }

  /**
   * Shutdown the pool by closing all connections and dereferencing values
   * @returns Promise resolves when the shutdown operation successed
   */
  public shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connections: Array<Promise<void>> = [];

      if (this.acquiredConnections.length > 0) {
        this.acquiredConnections.forEach((connection) => {
          connections.push(this.closeConnection(connection));
        });
      }

      if (this.idleConnectionQ.size() > 0) {
        this.idleConnectionQ.batch().forEach((job) => {
          connections.push(this.closeConnection(job()));
        });
      }

      Promise.all(connections)
        .then(() => {
          this.errors = null;
          this.driver = null;
          this.poolOptions = null;
          this.connectionOptions = null;
          this.removeAllListeners();

          this.connectionRequestQ.removeAllListeners();
          this.connectionRequestQ = null;

          this.idleConnectionQ.removeAllListeners();
          this.idleConnectionQ = null;

          let shutdownError = () =>
            Promise.reject(
              new MegaPoolError(
                `Can't perform any farther operations after shutdown`
              )
            );

          this.createConnection = shutdownError;
          this.closeConnection = shutdownError;
          this.request = shutdownError;
          this.query = shutdownError;

          shutdownError = () => {
            throw new MegaPoolError(
              `Can't perform any farther operations after shutdown`
            );
          };

          this.setError = shutdownError;
          this.getErrors = shutdownError as any;
          this.getAcquiredCount = shutdownError as any;
          this.getIdleCount = shutdownError as any;
          this.getRequestCount = shutdownError as any;
          this.hasAcquired = shutdownError as any;
          this.hasIdle = shutdownError as any;
          this.hasRequest = shutdownError as any;

          resolve();
        })
        // if the shutdown reject you should solve the problem and try again
        .catch((error) => reject(error));
    });
  }

  /**
   * Register the given error in the pull
   * @param error Instance of Error
   */
  public setError(error: Error): void {
    if (!Test.isChildOf(error, Error)) {
      throw new MegaPoolError("The error must be an instance of Error");
    }

    if (!Test.isText(error.name)) {
      throw new MegaPoolError("The error name must be a string");
    }

    if (!Test.isText(error.message)) {
      throw new MegaPoolError("The error message must be a string");
    }

    this.errors.push({
      id: this.id,
      name: error.name,
      message: error.message,
      timestamp: new Date(),
    });
  }

  /**
   * get all the errors in the pool
   */
  public getErrors(): PoolError[] {
    return this.errors;
  }

  /**
   * get acquired connections count
   */
  public getAcquiredCount(): number {
    return this.acquiredConnections.length;
  }

  /**
   * get idle connections count
   */
  public getIdleCount(): number {
    return this.idleConnectionQ.size();
  }

  /**
   * get current connection requests count
   */
  public getRequestCount(): number {
    return this.connectionRequestQ.size();
  }

  /**
   * Tells if the pool has acquired connections
   */
  public hasAcquired(): boolean {
    return this.acquiredConnections.length > 0;
  }

  /**
   * Tells if the pool has idle connections
   */
  public hasIdle(): boolean {
    return this.idleConnectionQ.size() > 0;
  }

  /**
   * Tells if the pool has connection requests
   */
  public hasRequest(): boolean {
    return this.connectionRequestQ.size() > 0;
  }

  /**
   * Get the current pool options
   */
  public getPoolOptions(): _MegaPoolOptions {
    return this.poolOptions;
  }

  /**
   * Get the current connection options
   */
  public getConnectionOptions(): _MegaConnectionOptions {
    return this.connectionOptions;
  }
  /**
   * Get the pool driver instance
   */
  public getDriver(): _MegaDriver {
    return this.driver;
  }
}
