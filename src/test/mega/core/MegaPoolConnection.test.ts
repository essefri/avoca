// use MegaPool Mock
jest.mock("../../../modules/mega/core/MegaPool");

// use MySQLConnection Mock
jest.mock("../../../modules/mega/drivers/MySQL/MySQLConnection");

import { QueryFailError } from "../../../errors/mega/QueryFailError";
import { MegaPoolConnectionError } from "../../../errors/mega/dev/MegaPoolConnectionError";
import { MegaPool } from "../../../modules/mega/core/MegaPool";
import { MegaPoolConnection } from "../../../modules/mega/core/MegaPoolConnection";
import { MySQLConnection } from "../../../modules/mega/drivers/MySQL/MySQLConnection";

describe("MegaPoolConnection.Constructor", () => {
  it("Should validaate the given connection", () => {
    // valid _MegaConnection
    const connection = new MySQLConnection(undefined);
    const pool = new MegaPool(undefined);
    expect(() => new MegaPoolConnection(connection, pool)).not.toThrow();

    // invalid _MegaConnection
    expect(() => new MegaPoolConnection({} as any, pool)).toThrow(
      MegaPoolConnectionError
    );
  });

  it("Should validate the given pool", () => {
    const connection = new MySQLConnection(undefined);

    // valid MegaPool instance
    const pool = new MegaPool(undefined);
    expect(() => new MegaPoolConnection(connection, pool)).not.toThrow();

    // invalid MegaPool instance
    expect(() => new MegaPoolConnection(connection, {} as any)).toThrow(
      MegaPoolConnectionError
    );
  });

  it("Should create a new MegaPoolConnection", () => {
    const pool = new MegaPool(undefined);
    const connection = new MySQLConnection(undefined);

    expect(new MegaPoolConnection(connection, pool)).toBeInstanceOf(
      MegaPoolConnection
    );
  });
});

describe("MegaPoolConnection.release", () => {
  // The release tells the pool you are done using the connection
  it("Should not be able to perform any farther operations after release", () => {
    const connection = new MySQLConnection(undefined);
    const pool = new MegaPool(undefined);

    // Create MegaPoolConnection with mock objects
    const megaPoolConnection = new MegaPoolConnection(connection, pool);

    // Release the connection
    megaPoolConnection.release();

    // Try to release again and expect an error
    expect(() => megaPoolConnection.release()).toThrowError(
      `Can't perform any farther operations after releasing the connection`
    );

    // Try to query and expect an error
    megaPoolConnection.query("sql").catch((error) => {
      expect(error.message).toBe(
        `Can't perform any farther operations after releasing the connection`
      );
    });
  });
});

describe("MegaPoolConnection.query", () => {
  it("Should resolve with data", async () => {
    // Create MySQLConnection and MegaPool instance
    const connection = new MySQLConnection(undefined);
    const pool = new MegaPool(undefined);

    // make MySQLConnection.query resolve with data
    connection.query = jest.fn(() => Promise.resolve("data")) as any;

    // make pool.emit a jest function
    pool.emit = jest.fn();

    // create a MegaPoolConnection
    const megaPoolConnection = new MegaPoolConnection(connection, pool);

    // execute qeury
    const result = await megaPoolConnection.query<string>(
      "SELECT * FROM table"
    );

    // make sure the connection.query is executed by megaPoolConnection
    expect(connection.query).toHaveBeenCalledWith(
      "SELECT * FROM table",
      undefined
    );

    // Pool should emit a QuerySuccess event
    expect(pool.emit).toHaveBeenCalledWith("QuerySuccess", "data");

    // Query should resolve with data
    expect(result).toBe("data");
  });

  it("should reject with QueryFailError", async () => {
    // Create MySQLConnection and MegaPool instance
    const connection = new MySQLConnection(undefined);
    const pool = new MegaPool(undefined);

    // make MySQLConnection.query reject with error
    connection.query = jest.fn(() => Promise.reject(new Error("message")));

    // make pool.emit = jest function
    pool.emit = jest.fn();

    // create a MegaPoolConnection
    const megaPoolConnection = new MegaPoolConnection(connection, pool);

    // execute qeury
    const result = await megaPoolConnection.query<QueryFailError>(
      "SELECT * FROM table"
    );

    // // Pool should emit a QueryFail event
    // expect(pool.emit).toHaveBeenCalledWith(
    //   "QueryFail",
    //   expect.any(QueryFailError)
    // );

    // // Query should reject with error
    // expect(result).toBeInstanceOf(QueryFailError);
  });

  // it("Should reject with The QueryFailError default message", async () => {
  //   // Create MySQLConnection and MegaPool instance
  //   const connection = new MySQLConnection(undefined);
  //   const pool = new MegaPool(undefined);

  //   // make MySQLConnection.query reject with no error
  //   connection.query = jest.fn(() => Promise.reject());

  //   // make pool.emit a jest function
  //   pool.emit = jest.fn();

  //   // create a MegaPoolConnection
  //   const megaPoolConnection = new MegaPoolConnection(connection, pool);

  //   // execute qeury
  //   const result = await megaPoolConnection.query<QueryFailError>(
  //     "SELECT * FROM table"
  //   );

  //   // Pool should emit a QueryFail event with QueryFailError
  //   expect(pool.emit).toHaveBeenCalledWith("QueryFail", QueryFailError);

  //   // Query should reject with QueryFailError
  //   expect(result).toBeInstanceOf(QueryFailError);

  //   // Message should be "Query execution failed"
  //   expect(result.message).toBe("Query execution failed");
  // });
});
