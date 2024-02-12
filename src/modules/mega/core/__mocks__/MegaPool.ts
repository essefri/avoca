import { EventEmitter } from 'events';
import { MegaPoolConnection } from '../MegaPoolConnection';

export class MegaPool extends EventEmitter {
  request: jest.Mock;
  shutdown: jest.Mock;
  query: jest.Mock;

  constructor() {
    super();

    this.request = jest.fn(() =>
      Promise.resolve(
        new MegaPoolConnection(undefined as any, undefined as any)
      )
    );
    this.shutdown = jest.fn(() => Promise.resolve());
    this.query = jest.fn(() => Promise.resolve('data'));
  }
}
