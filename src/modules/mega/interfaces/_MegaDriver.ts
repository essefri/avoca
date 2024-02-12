import { _MegaConnection } from './_MegaConnection';

export interface _MegaDriver {
  createConnection(options: any): Promise<_MegaConnection>;
}
