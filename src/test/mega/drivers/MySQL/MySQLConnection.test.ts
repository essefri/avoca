jest.mock('mysql2/promise');

import { MySQLConnectionError } from '../../../../errors/mega/drivers/MySQLConnectionError';
import { MySQLConnection } from '../../../../modules/mega/drivers/MySQL/MySQLConnection';
import { createConnection } from 'mysql2/promise';

describe('MySQLConnection.constructor', () => {
  it('should create an instance successfully', async () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => {},
      end: () => {},
    });

    const connection = await createConnection({});

    expect(() => new MySQLConnection(connection)).not.toThrow();
  });

  it('should throw if the connection object is invalid', () => {
    expect(() => new MySQLConnection({} as any)).toThrow(
      `The 'connection' argument must be a valid connection object`
    );

    expect(() => new MySQLConnection([] as any)).toThrow(
      `The 'connection' argument must be a valid connection object`
    );

    expect(() => new MySQLConnection(null as any)).toThrow(
      `The 'connection' argument must be a valid connection object`
    );

    expect(() => new MySQLConnection('connection' as any)).toThrow(
      `The 'connection' argument must be a valid connection object`
    );
  });
});

describe('MySQLConnection.query', () => {
  it('should resolves if the connection resolves', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: jest.fn(() => Promise.resolve('query data')),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection)
        .query('sql', 'values' as any)
        .then((result) => {
          expect(result).toBe('query data');
          expect(connection.query).toHaveBeenCalledTimes(1);
          expect(connection.query).toHaveBeenCalledWith('sql', 'values');
        });
    });
  });

  it('should resolves if a value is returned', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: jest.fn(() => 'query data'),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection)
        .query('sql', 'values' as any)
        .then((result) => {
          expect(result).toBe('query data');
          expect(connection.query).toHaveBeenCalledTimes(1);
          expect(connection.query).toHaveBeenCalledWith('sql', 'values');
        });
    });
  });

  it('should reject if the connection rejects ', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: jest.fn(() => Promise.reject(new Error('message'))),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection)
        .query('sql', 'values' as any)
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('message');
          expect(connection.query).toHaveBeenCalledTimes(1);
          expect(connection.query).toHaveBeenCalledWith('sql', 'values');
        });
    });
  });

  it('should reject if an error occurs', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: jest.fn(() => {
        throw new Error('message');
      }),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection)
        .query('sql', 'values' as any)
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('message');
          expect(connection.query).toHaveBeenCalledTimes(1);
          expect(connection.query).toHaveBeenCalledWith('sql', 'values');
        });
    });
  });
});

describe('MySQLConnection.close', () => {
  it('should close the connection successfully', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => Promise.resolve('query result'),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection).close().then((result) => {
        expect(result).toBeUndefined();
      });
    });
  });

  it('should reject if there was a problem', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => Promise.resolve('query result'),
      end: () => Promise.reject('could not close the connection'),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection).close().catch((result) => {
        expect(result).toBe('could not close the connection');
      });
    });
  });

  it('should not execute any farther operations', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => Promise.resolve('data'),
      end: () => Promise.resolve(),
    });

    createConnection({}).then((connection) => {
      // create connection
      const mysqlCon = new MySQLConnection(connection);

      // close the connection
      mysqlCon.close();

      // execute farther operations
      mysqlCon.query('sql').catch((error) => {
        expect(error).toBeInstanceOf(MySQLConnectionError);
        expect(error.message).toEqual('Connection have been closed');
      });

      mysqlCon.isAlive().catch((error) => {
        expect(error).toBeInstanceOf(MySQLConnectionError);
        expect(error.message).toEqual('Connection have been closed');
      });
    });
  });
});

describe('MySQLConnection.isAlive', () => {
  it('should resolve if the connection still alive', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => Promise.resolve(),
      end: () => Promise.reject(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection).isAlive().then((result) => {
        expect(result).toBeUndefined;
      });
    });
  });

  it('should reject if the connection is dead', () => {
    (createConnection as jest.Mock).mockResolvedValue({
      query: () => Promise.reject(),
      end: () => Promise.reject(),
    });

    createConnection({}).then((connection) => {
      new MySQLConnection(connection).isAlive().catch((result) => {
        expect(result).toBeUndefined;
      });
    });
  });
});
