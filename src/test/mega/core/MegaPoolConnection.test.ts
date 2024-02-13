jest.mock("../../../modules/mega/core/MegaPool");
jest.mock("../../../modules/mega/drivers/MySQL/MySQLConnection");

// jest.mock("../../../modules/mega/core/MegaPoolConnection");

import { QueryFailError } from "../../../errors/mega/QueryFailError";
import { MegaPool } from "../../../modules/mega/core/MegaPool";
import { MegaPoolConnection } from "../../../modules/mega/core/MegaPoolConnection";
import { MySQLConnection } from "../../../modules/mega/drivers/MySQL/MySQLConnection";

describe("MegaPoolConnection.Constructor", () => {
  it("connection must be a valid _MegaConnection", () => {
    const connection = new MySQLConnection(undefined);
    console.log(connection);

    const pool = new MegaPool(undefined);
    console.log(pool);

    const c = new MegaPoolConnection(connection, pool);
    console.log(c);
  });

  // it("pool must be a valid MegaPool", () => {
  //   expect(
  //     () => new MegaPoolConnection(new MySQLConnection(undefined), {} as any)
  //   ).toThrow(`The 'pool' argument must be an instance of 'MegaPool'`);
  // });

  // it("should create a new MegaPoolConnection", () => {
  //   const pool = new MegaPool(undefined);
  //   const connection = new MySQLConnection(undefined);

  //   expect(new MegaPoolConnection(connection, pool)).toBeInstanceOf(
  //     MegaPoolConnection
  //   );
  // });
});

// describe("MegaPoolConnection.release", () => {
//   it("should emit the ConnectionRelease event", () => {
//     const connection = new MySQLConnection(undefined);
//     const pool = new MegaPool(undefined);
//     pool.emit = jest.fn();
//     // Create MegaPoolConnection with mock objects
//     const megaPoolConnection = new MegaPoolConnection(connection, pool);

//     // Release the connection
//     megaPoolConnection.release();

//     // Check if ConnectionRelease event is emitted
//     expect(pool.emit).toHaveBeenCalledWith("ConnectionRelease", connection);
//   });

//   it("Cant perform any farther operations after releasing the connection", () => {
//     const connection = new MySQLConnection(undefined);
//     const pool = new MegaPool(undefined);

//     // Create MegaPoolConnection with mock objects
//     const megaPoolConnection = new MegaPoolConnection(connection, pool);

//     // Release the connection
//     megaPoolConnection.release();

//     // Try to release again and expect an error
//     expect(() => megaPoolConnection.release()).toThrowError(
//       `Can't perform any farther operations after releasing the connection`
//     );

//     megaPoolConnection.query("sql").catch((error) => {
//       expect(error.message).toBe(
//         `Can't perform any farther operations after releasing the connection`
//       );
//     });
//   });
// });

// describe("MegaPoolConnection.query", () => {
//   it("should execute query successfully and emit QuerySuccess event", async () => {
//     const connection = new MySQLConnection(undefined);
//     connection.query = jest.fn(() => Promise.resolve("query result")) as any;

//     const pool = new MegaPool(undefined);
//     pool.emit = jest.fn();

//     const megaPoolConnection = new MegaPoolConnection(connection, pool);

//     const result = await megaPoolConnection.query<string>(
//       "SELECT * FROM table"
//     );

//     // Verify that the query method was called with the correct parameters
//     expect(connection.query).toHaveBeenCalledWith(
//       "SELECT * FROM table",
//       undefined
//     );

//     // Verify that the QuerySuccess event was emitted with the correct data
//     expect(pool.emit).toHaveBeenCalledWith("QuerySuccess", "query result");

//     // Verify that the method resolved with the expected result
//     expect(result).toBe("query result");
//   });

//   it("should handle query failure and emit QueryFail event", async () => {
//     const connection = new MySQLConnection(undefined);
//     connection.query = jest.fn(() =>
//       Promise.reject(new Error("message"))
//     ) as any;

//     const pool = new MegaPool(undefined);
//     pool.emit = jest.fn();

//     const megaPoolConnection = new MegaPoolConnection(connection, pool);

//     try {
//       await megaPoolConnection.query<string>("SELECT * FROM table");
//     } catch (error) {
//       // Verify that the QueryFail event was emitted with the correct error message
//       expect(pool.emit).toHaveBeenCalledWith("QueryFail", "message");

//       // Verify that the method rejected with the expected error
//       expect(error).toBeInstanceOf(QueryFailError);
//       expect((error as Error).message).toBe("message");
//     }
//   });

//   it("should handle query failure using a default message", async () => {
//     const connection = new MySQLConnection(undefined);
//     connection.query = jest.fn(
//       () => Promise.reject() // no reason
//     ) as any;

//     const pool = new MegaPool(undefined);
//     pool.emit = jest.fn();

//     const megaPoolConnection = new MegaPoolConnection(connection, pool);

//     try {
//       await megaPoolConnection.query<string>("SELECT * FROM table");
//     } catch (error) {
//       // Verify that the QueryFail event was emitted with the correct error message
//       expect(pool.emit).toHaveBeenCalledWith(
//         "QueryFail",
//         "Query execution failed"
//       );

//       // Verify that the method rejected with the expected error
//       expect(error).toBeInstanceOf(QueryFailError);
//       expect((error as Error).message).toBe("Query execution failed");
//     }
//   });
// });
