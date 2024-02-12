export class MySQLConnection {
  query: jest.Mock = jest.fn(() => Promise.resolve());
  close: jest.Mock = jest.fn(() => Promise.resolve());
  isAlive: jest.Mock = jest.fn(() => Promise.resolve());

  constructor() {
    // Ensure that methods are jest.fn() mocks
    this.query = jest.fn(() => Promise.resolve());
    this.close = jest.fn(() => Promise.resolve());
    this.isAlive = jest.fn(() => Promise.resolve());
  }
}
