export class MegaPoolConnection {
  release: jest.Mock;
  query: jest.Mock;

  constructor() {
    this.release = jest.fn();
    this.query = jest.fn(() => Promise.resolve('data'));
  }
}
