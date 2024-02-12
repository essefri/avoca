import { _MegaDriverOptions } from './_MegaDriverOptions';
import { _MegaPoolOptions } from './_MegaPoolOptions';

export interface _MegaConnectionOptions {
  driver?: _MegaDriverOptions;
  user?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  charset?: string;
  timezone?: string;
  multipleStatements?: boolean;
  ssl?: string;
}
