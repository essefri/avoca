jest.mock('../../../../modules/mega/drivers/MySQL/MySQLConnection');
jest.mock('mysql2/promise');

import { createConnection } from 'mysql2/promise';
import { MySQLConnection } from '../../../../modules/mega/drivers/MySQL/MySQLConnection';
import { MySQLDriver } from '../../../../modules/mega/drivers/MySQL/MySQLDriver';
import { _MySQLOptions } from '../../../../modules/mega/types/_MySQLOptions';
import { CreateConnectionError } from '../../../../errors/mega/CreateConnectionError';

describe('MySQLDriver.createConnection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with a connection', async () => {
    (createConnection as jest.Mock).mockResolvedValue('connection');
    const options = {};
    const connection = await new MySQLDriver().createConnection(options);

    expect(connection).toBeInstanceOf(MySQLConnection);

    expect(createConnection).toHaveBeenCalledWith(options);
    expect(createConnection).toHaveBeenCalledTimes(1);

    expect(MySQLConnection).toHaveBeenCalledWith('connection');
    expect(MySQLConnection).toHaveBeenCalledTimes(1);
  });

  it('should reject with with the given message', async () => {
    (createConnection as jest.Mock).mockRejectedValue(new Error('message'));
    const options = {};

    try {
      await new MySQLDriver().createConnection({});
    } catch (error) {
      expect(error).toBeInstanceOf(CreateConnectionError);
      expect((error as Error).message).toBe('message');

      expect(createConnection).toHaveBeenCalledWith(options);
      expect(createConnection).toHaveBeenCalledTimes(1);

      expect(MySQLConnection).not.toHaveBeenCalled;
    }
  });

  it('should reject with the default message', async () => {
    (createConnection as jest.Mock).mockRejectedValue('message');
    const options = {};

    try {
      await new MySQLDriver().createConnection({});
    } catch (error) {
      expect(error).toBeInstanceOf(CreateConnectionError);
      expect((error as Error).message).toBe('Connection creation fails');

      expect(createConnection).toHaveBeenCalledWith(options);
      expect(createConnection).toHaveBeenCalledTimes(1);

      expect(MySQLConnection).not.toHaveBeenCalled;
    }
  });
});
