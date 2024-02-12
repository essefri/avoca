import { createConnection } from 'mysql2/promise';
import { MySQLConnection } from './MySQLConnection';

import { _MySQLOptions } from '../../types/_MySQLOptions';
import { _MegaDriver } from '../../interfaces/_MegaDriver';
import { CreateConnectionError } from '../../../../errors/mega/CreateConnectionError';

export class MySQLDriver implements _MegaDriver {
  createConnection(options: _MySQLOptions): Promise<MySQLConnection> {
    return new Promise((resolve, reject) => {
      createConnection(options)
        .then((connection) => resolve(new MySQLConnection(connection)))
        .catch((error) =>
          reject(
            new CreateConnectionError(
              error instanceof Error && typeof error.message === 'string'
                ? error.message
                : 'Connection creation failed'
            )
          )
        );
    });
  }
}
