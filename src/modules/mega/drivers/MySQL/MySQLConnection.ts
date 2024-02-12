import { Connection } from 'mysql2/promise';
import { _MegaConnection } from '../../interfaces/_MegaConnection';
import { CreateConnectionError } from '../../../../errors/mega/CreateConnectionError';
import { Test } from '../../../utils/Test';
import { MySQLConnectionError } from '../../../../errors/mega/drivers/MySQLConnectionError';

export class MySQLConnection implements _MegaConnection {

    /**
   * The Instance identifier
   */
    public id: Symbol;

  /**
   * The Inner MySQL Connection
   */
  private connection: Connection;


  /**
   * Creates an instance of MySQLConnection
   * @param connection The Inner MySQL Connection
   */
  constructor(connection: Connection) {
    if (!this.isConnection(connection)) {
      throw new CreateConnectionError(
        `The 'connection' argument must be a valid connection object`
      );
    }

    this.connection = connection;
    this.id = Symbol('MySQL connection id');
  }

  /**
   * Tells if the given connection is a valid connection
   * @param connection The inner MySQLConnection
   * @returns Boolean true if the connection is valid false otherwise
   */
  private isConnection(connection: Connection): boolean {
    return (
      Test.isObject(connection) &&
      Test.areFunctions(connection.query, connection.end)
    );
  }

  /**
   * Executes the sql Query
   * @param sql The sql string
   * @param values The values to be replaced
   * @returns Promise of the expected data
   */
  public query<T>(sql: string, values?: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      resolve(this.connection.execute(sql, values) as Promise<T>);
    });
  }

  /**
   * Closes the connection
   * @returns Promise resolves when the connection close successfully
   */
  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.end().then(() => {
        this.isAlive = () => Promise.reject(new MySQLConnectionError('Connection have been closed'));
        this.query = () => Promise.reject(new MySQLConnectionError('Connection have been closed'));        
        this.connection = null;
        resolve()
      }).catch((err) => reject(err))
    });
  }

  /**
   * Tells if the connection is still a live
   * when the promise resolves the connection is still alive
   * when the promise rejects the connection is dead
   */
  public isAlive(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection
        .query('SELECT 1')
        .then(() => resolve())
        .catch(() => reject());
    });
  }
}
