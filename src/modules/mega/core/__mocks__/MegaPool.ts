import { EventEmitter } from "events";
import { MegaPoolConnection } from "../MegaPoolConnection";

export class MegaPool extends EventEmitter {
  request: jest.Mock;
  shutdown: jest.Mock;
  query: jest.Mock;
  release: jest.Mock;

  constructor() {
    super();

    this.shutdown = jest.fn();
    this.query = jest.fn();
    this.release = jest.fn();
    this.request = jest.fn();
  }
}
