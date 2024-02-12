import { _MegaConnectionOptions } from './_MegaConnectionOptions';
import { _MegaDriverOptions } from './_MegaDriverOptions';
import { _MegaPoolOptions } from './_MegaPoolOptions';

export interface _MegaConfigurationOptions {
  default: string;
  connections: { [key: string]: _MegaConnectionOptions & _MegaPoolOptions };
}
