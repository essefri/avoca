jest.mock("../../../modules/mega/drivers/MySQL/MySQLConnection");
jest.mock("../../../modules/mega/drivers/MySQL/MySQLDriver");
jest.mock("../../../modules/Echo");

import { MegaPool } from "../../../modules/mega/core/MegaPool";
import { MegaPoolConnection } from "../../../modules/mega/core/MegaPoolConnection";

import { Echo } from "../../../modules/utils/Echo";

import { MySQLConnection } from "../../../modules/mega/drivers/MySQL/MySQLConnection";
import { MySQLDriver } from "../../../modules/mega/drivers/MySQL/MySQLDriver";

import { CreateConnectionError } from "../../../errors/mega/CreateConnectionError";
import { CloseConnectionError } from "../../../errors/mega/CloseConnectionError";
import { MaxQueueSizeError } from "../../../errors/mega/MaxQueueSizeError";
import { MaxConnectionError } from "../../../errors/mega/MaxConnectionError";
import { MaxQueueTimeError } from "../../../errors/mega/MaxQueueTimeError";
import { QueryFailError } from "../../../errors/mega/QueryFailError";
import { MegaPoolError } from "../../../errors/mega/dev/MegaPoolError";
import { _MegaConnection } from "../../../modules/mega/interfaces/_MegaConnection";

let driver = new MySQLDriver();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MegaPool.constructor", () => {
  it("connectionOptions are required", () => {
    expect(() => new MegaPool(undefined)).toThrow(
      `The 'connectionOptions' argument must be an object`
    );

    expect(() => new MegaPool({})).not.toThrow();
  });

  describe("PoolOptions", () => {
    it("poolOptions are optional", () => {
      expect(() => new MegaPool({})).not.toThrow();
      expect(() => new MegaPool({}, undefined)).not.toThrow();
      expect(new MegaPool({}).getPoolOptions()).toMatchObject({
        maxConnections: 10,
        maxIdleTime: 60000,
        shouldQueue: true,
        maxQueueSize: Infinity,
        maxQueueTime: 1000,
        shouldRetry: true,
        maxRetry: 3,
        retryDelay: 500,
        extraDelay: 500,
      });
    });

    it("poolOptions must be an object", () => {
      expect(() => new MegaPool({}, [] as any)).toThrow(
        `The 'poolOptions' argument must be an object`
      );
      expect(() => new MegaPool({}, null as any)).toThrow(
        `The 'poolOptions' argument must be an object`
      );
      expect(() => new MegaPool({}, {})).not.toThrow();
    });

    it("maxConnections must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { maxConnections: 0 }).getPoolOptions().maxConnections
      ).toBe(10);
      expect(
        new MegaPool({}, { maxConnections: "any" as any }).getPoolOptions()
          .maxConnections
      ).toBe(10);
      expect(
        new MegaPool({}, { maxConnections: 5 }).getPoolOptions().maxConnections
      ).toBe(5);
    });

    it("maxIdleTime must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { maxIdleTime: 0 }).getPoolOptions().maxIdleTime
      ).toBe(60000);
      expect(
        new MegaPool({}, { maxIdleTime: "any" as any }).getPoolOptions()
          .maxIdleTime
      ).toBe(60000);
      expect(
        new MegaPool({}, { maxIdleTime: 1000 }).getPoolOptions().maxIdleTime
      ).toBe(1000);
    });

    it("shouldQueue must be a boolean", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { shouldQueue: 0 as any }).getPoolOptions().shouldQueue
      ).toBe(true);
      expect(
        new MegaPool({}, { shouldQueue: "any" as any }).getPoolOptions()
          .shouldQueue
      ).toBe(true);

      expect(
        new MegaPool({}, { shouldQueue: false }).getPoolOptions().shouldQueue
      ).toBe(false);
    });

    it("maxQueueSize must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { maxQueueSize: 0 as any }).getPoolOptions()
          .maxQueueSize
      ).toBe(Infinity);

      expect(
        new MegaPool({}, { maxQueueSize: "any" as any }).getPoolOptions()
          .maxQueueSize
      ).toBe(Infinity);

      expect(
        new MegaPool({}, { maxQueueSize: Infinity }).getPoolOptions()
          .maxQueueSize
      ).toBe(Infinity);

      expect(
        new MegaPool({}, { maxQueueSize: 12 }).getPoolOptions().maxQueueSize
      ).toBe(12);
    });

    it("maxQueueTime must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { maxQueueTime: 0 as any }).getPoolOptions()
          .maxQueueTime
      ).toBe(1000);

      expect(
        new MegaPool({}, { maxQueueTime: "any" as any }).getPoolOptions()
          .maxQueueTime
      ).toBe(1000);

      expect(
        new MegaPool({}, { maxQueueTime: 2000 }).getPoolOptions().maxQueueTime
      ).toBe(2000);
    });

    it("shouldRetry must be a boolean", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { shouldRetry: 0 as any }).getPoolOptions().shouldRetry
      ).toBe(true);

      expect(
        new MegaPool({}, { shouldRetry: "any" as any }).getPoolOptions()
          .shouldRetry
      ).toBe(true);

      expect(
        new MegaPool({}, { shouldRetry: false }).getPoolOptions().shouldRetry
      ).toBe(false);
    });

    it("maxRetry must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { maxRetry: 0 as any }).getPoolOptions().maxRetry
      ).toBe(3);

      expect(
        new MegaPool({}, { maxRetry: "any" as any }).getPoolOptions().maxRetry
      ).toBe(3);

      expect(new MegaPool({}, { maxRetry: 6 }).getPoolOptions().maxRetry).toBe(
        6
      );
    });

    it("retryDelay must be an integer > 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { retryDelay: 0 as any }).getPoolOptions().retryDelay
      ).toBe(500);

      expect(
        new MegaPool({}, { retryDelay: "any" as any }).getPoolOptions()
          .retryDelay
      ).toBe(500);

      expect(
        new MegaPool({}, { retryDelay: 1000 }).getPoolOptions().retryDelay
      ).toBe(1000);
    });

    it("extraDelay must be an integer >= 0", () => {
      // default value is used in case the argument is invalid
      expect(
        new MegaPool({}, { extraDelay: -1 as any }).getPoolOptions().extraDelay
      ).toBe(500);

      expect(
        new MegaPool({}, { extraDelay: "any" as any }).getPoolOptions()
          .extraDelay
      ).toBe(500);

      expect(
        new MegaPool({}, { extraDelay: 1000 }).getPoolOptions().extraDelay
      ).toBe(1000);
    });
  });

  describe("driver", () => {
    it("driver is optional", () => {
      expect(() => new MegaPool({}, undefined, undefined)).not.toThrow();
      // MySQLDriver is used as a default driver
      expect(new MegaPool({}).getDriver()).toBeInstanceOf(MySQLDriver);
      expect(
        new MegaPool({}, undefined, new MySQLDriver()).getDriver()
      ).toBeInstanceOf(MySQLDriver);
    });

    it("driver must be a valid mega driver", () => {
      expect(() => new MegaPool({}, undefined, [] as any)).toThrow(
        `The 'driver' argument must be a valid mega driver`
      );
      expect(() => new MegaPool({}, undefined, {} as any)).toThrow(
        `The 'driver' argument must be a valid mega driver`
      );

      expect(() => new MegaPool({}, undefined, "driver" as any)).toThrow(
        `The 'driver' argument must be a valid mega driver`
      );
    });
  });

  it("should register a ConnectionRelease event hanlder", () => {
    const pool = new MegaPool({});
    expect(pool.eventNames().includes("ConnectionRelease")).toBe(true);
  });
});

describe("MegaPool.request", () => {
  describe("Create Connection Tests", () => {
    it("should successfully create a connection, emits an event, and resolves", async () => {
      const pool = new MegaPool({}, undefined, driver);

      const action = jest.fn();
      pool.on("CreateSuccess", action);

      const connection1 = await pool.request();

      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(connection1).toBeInstanceOf(MegaPoolConnection);
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith(connection1);

      // clean up
      connection1.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should fail to create a connection, emits an event, and rejects", async () => {
      // retry is not allowed
      const pool = new MegaPool({}, { shouldRetry: false }, driver);

      const action = jest.fn();
      pool.on("CreateFail", action);

      // connection creation rejects for now reason
      (driver.createConnection as jest.Mock).mockImplementationOnce(() =>
        Promise.reject()
      );

      await expect(pool.request()).rejects.toBeInstanceOf(
        CreateConnectionError
      );

      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("Failed to create the connection");
      expect(pool.getErrors().length).toBe(1);
      expect(pool.getErrors()[0].name).toBe("CreateConnectionError");
      expect(pool.getErrors()[0].message).toBe(
        "Failed to create the connection"
      );

      (driver.createConnection as jest.Mock).mockClear();
      action.mockClear();

      // connection creation rejects for a reason
      (driver.createConnection as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("message"))
      );

      await expect(pool.request()).rejects.toBeInstanceOf(
        CreateConnectionError
      );

      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("message");
      expect(pool.getErrors().length).toBe(2);
      expect(pool.getErrors()[1].name).toBe("CreateConnectionError");
      expect(pool.getErrors()[1].message).toBe("message");

      // clean up
      expect(await pool.shutdown()).resolves;
    });

    it("should fail to create a connection, retry, emits an event, and resolves", async () => {
      // retry is allowed
      const pool = new MegaPool(
        {},
        { shouldRetry: true, retryDelay: 200, maxRetry: 2, extraDelay: 200 },
        driver
      );

      const action = jest.fn();
      pool.on("CreateSuccess", action);

      // connection creation rejects 2 times
      (driver.createConnection as jest.Mock)
        // creation fail
        .mockImplementationOnce(() => Promise.reject())
        // first retry fail
        .mockImplementationOnce(() => Promise.reject())
        // second retry works
        .mockImplementationOnce(() =>
          Promise.resolve(new MySQLConnection({} as any))
        );

      const connection1 = await pool.request();
      expect(connection1).toBeInstanceOf(MegaPoolConnection);
      expect(driver.createConnection).toHaveBeenCalledTimes(3);

      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith(connection1);

      expect(Echo.retry).toHaveBeenCalledTimes(1);

      // clean up
      connection1.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should fail to create a connection, retry, emits an event, and rejects", async () => {
      // retry is allowed
      const pool = new MegaPool(
        {},
        { shouldRetry: true, retryDelay: 200, maxRetry: 1, extraDelay: 200 },
        driver
      );

      const action = jest.fn();
      pool.on("CreateFail", action);

      // connection creation rejects 2 times
      (driver.createConnection as jest.Mock)
        // creation fail
        .mockImplementationOnce(() => Promise.reject())
        // first retry fail and rejects
        .mockImplementationOnce(() => Promise.reject(new Error("message")));

      await expect(pool.request()).rejects.toBeInstanceOf(
        CreateConnectionError
      );
      expect(driver.createConnection).toHaveBeenCalledTimes(2);

      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("message");

      expect(Echo.retry).toHaveBeenCalledTimes(1);

      expect(pool.getErrors().length).toBe(1);
      expect(pool.getErrors()[0].name).toBe("CreateConnectionError");
      expect(pool.getErrors()[0].message).toBe("message");

      // clean up
      expect(await pool.shutdown()).resolves;
    });
  });

  describe("Idle Connection Tests", () => {
    it("should resolve when the idle connection only when its still alive", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure the connection is still alive
      MySQLConn.isAlive = jest.fn(() => Promise.resolve());
      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      const pool = new MegaPool({}, undefined, driver);

      // create a connection
      const connection1 = await pool.request();

      // make it idle
      connection1.release();

      // request an idle connection
      const connection2 = await pool.request();

      expect(connection2).toBeInstanceOf(MegaPoolConnection);
      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(MySQLConn.isAlive).toHaveBeenCalledTimes(1);

      connection2.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should close a dead idle connection, resolve with a new created connection", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure all connections are dead
      MySQLConn.isAlive = jest.fn(() => Promise.reject());
      // make sure all connection can be closed successfully
      MySQLConn.close = jest.fn(() => Promise.resolve());
      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      const pool = new MegaPool({}, undefined, driver);
      const action = jest.fn();
      pool.on("CloseSuccess", action);

      // create a connection
      const connection1 = await pool.request();

      // make it idle
      connection1.release();

      // request an idle connection
      const connection2 = await pool.request();

      expect(connection2).toBeInstanceOf(MegaPoolConnection);
      // the connection 2 is a new created connection
      expect(driver.createConnection).toHaveBeenCalledTimes(2);
      // the connection 1 is dead
      expect(MySQLConn.isAlive).toHaveBeenCalledTimes(1);
      expect(MySQLConn.isAlive).rejects;
      // the connection 1 have been closed
      expect(MySQLConn.close).toHaveBeenCalledTimes(1);
      expect(MySQLConn.close).resolves;

      // pool emits a CloseSuccess event
      expect(action).toHaveBeenCalledTimes(1);

      connection2.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should close a dead idle connection, resolve with another alive idle connection", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure only the first idle connection is dead
      MySQLConn.isAlive = jest
        .fn(() => Promise.resolve())
        .mockImplementationOnce(() => Promise.reject());
      // make sure all connection can be closed successfully
      MySQLConn.close = jest.fn(() => Promise.resolve());
      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      const pool = new MegaPool({}, undefined, driver);

      // create two idle connections
      const connection1 = await pool.request();
      const connection2 = await pool.request();

      // make them idle
      connection1.release();
      connection2.release();

      // there are two idle connections now
      expect(driver.createConnection).toHaveBeenCalledTimes(2);
      expect(pool.getIdleCount()).toBe(2);

      // request an idle connection
      const connection3 = await pool.request();

      expect(connection3).toBeInstanceOf(MegaPoolConnection);

      // the connection 1 is dead and 2 is alive
      expect(MySQLConn.isAlive).toHaveBeenCalledTimes(2);

      // the connection 1 have been closed
      expect(MySQLConn.close).toHaveBeenCalledTimes(1);
      expect(MySQLConn.close).resolves;

      // now we have now idle connections
      // becoause one is closed and another one is aqcuired
      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getIdleCount()).toBe(0);

      connection3.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should close all dead idle connections, resolve with a new created connection", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure all connections are dead
      MySQLConn.isAlive = jest.fn(() => Promise.reject());

      // make sure all connection can be closed successfully
      MySQLConn.close = jest.fn(() => Promise.resolve());
      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      const pool = new MegaPool({}, undefined, driver);

      // create two idle connections
      const connection1 = await pool.request();
      const connection2 = await pool.request();

      // make them idle
      connection1.release();
      connection2.release();

      // there are two idle connections now
      expect(driver.createConnection).toHaveBeenCalledTimes(2);
      expect(pool.getIdleCount()).toBe(2);

      // request an idle connection
      const connection3 = await pool.request();

      expect(connection3).toBeInstanceOf(MegaPoolConnection);

      // all connections are dead
      expect(MySQLConn.isAlive).toHaveBeenCalledTimes(2);
      expect(MySQLConn.isAlive).rejects;

      // all idle connection have been closed
      expect(MySQLConn.close).toHaveBeenCalledTimes(2);
      expect(MySQLConn.close).resolves;

      // now we have now idle connections
      // becoause one is closed and another one is aqcuired
      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getIdleCount()).toBe(0);

      // the acquired connection is new created connection
      expect(driver.createConnection).toHaveBeenCalledTimes(3);

      // clean up
      connection3.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should close all dead idle connections, reject with CreateConnectionError", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure all connections are dead
      MySQLConn.isAlive = jest.fn(() => Promise.reject());

      // make sure all connection can be closed successfully
      MySQLConn.close = jest.fn(() => Promise.resolve());

      (driver.createConnection as jest.Mock)
        .mockRejectedValue(new Error("message"))
        .mockResolvedValueOnce(MySQLConn)
        .mockResolvedValueOnce(MySQLConn);

      const pool = new MegaPool({}, undefined, driver);
      const action = jest.fn();
      pool.on("CloseSuccess", action);

      // create two idle connections
      const connection1 = await pool.request();
      const connection2 = await pool.request();

      // make them idle
      connection1.release();
      connection2.release();

      // there are two idle connections now
      expect(driver.createConnection).toHaveBeenCalledTimes(2);
      expect(pool.getIdleCount()).toBe(2);

      // request an idle connection
      pool.request().catch((error) => {
        expect(error).toBeInstanceOf(CreateConnectionError);
        expect(pool.getIdleCount()).toBe(0);
        expect(pool.getAcquiredCount()).toBe(0);
        expect(action).toHaveBeenCalledTimes(2);
      });
    });

    it("should fail to close a dead idle connection, and reject", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure all connections are dead
      MySQLConn.isAlive = jest.fn(() => Promise.reject());

      // make closing the connection fails
      MySQLConn.close = jest.fn(() => Promise.reject(new Error("message")));

      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      const pool = new MegaPool({}, { shouldRetry: false }, driver);
      const action = jest.fn();
      pool.on("CloseFail", action);

      // create two idle connections
      const connection1 = await pool.request();
      const connection2 = await pool.request();
      connection1.release();
      connection2.release();

      // there are two idle connections now
      expect(driver.createConnection).toHaveBeenCalledTimes(2);
      expect(pool.getIdleCount()).toBe(2);

      // request an idle connection
      await expect(pool.request()).rejects.toBeInstanceOf(CloseConnectionError);

      // first alive check fails
      expect(MySQLConn.isAlive).toHaveBeenCalledTimes(1);
      expect(MySQLConn.isAlive).rejects;

      // the first idle connection could not be closed
      expect(MySQLConn.close).toHaveBeenCalledTimes(1);
      expect(MySQLConn.close).rejects;

      // now we have one idle connection left
      // the other one could not be closed and dereferenced
      expect(pool.getAcquiredCount()).toBe(0);
      expect(pool.getIdleCount()).toBe(1);

      // the pool registed a CloseConnectionError for the admin
      expect(pool.getErrors().length).toBe(1);
      expect(pool.getErrors()[0].name).toBe("CloseConnectionError");
      expect(pool.getErrors()[0].message).toBe("message");

      // the pool emits a CloseConnection event for the admin to handle this case
      expect(action).toHaveBeenCalledTimes(1);

      try {
        await pool.shutdown();
      } catch (error) {
        expect(error).toBeInstanceOf(CloseConnectionError);
      }
    });

    it("should fail to close a dead idle connection, retry successfully, and resolve", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure the first connection is dead
      MySQLConn.isAlive = jest
        .fn(() => Promise.resolve())
        .mockImplementationOnce(() => Promise.reject());

      // make the first close fail
      MySQLConn.close = jest
        .fn(() => Promise.resolve())
        .mockImplementationOnce(() => Promise.reject());
      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      // enable retry
      const pool = new MegaPool({}, { shouldRetry: true }, driver);

      // create an idle connections
      const connection1 = await pool.request();
      connection1.release();

      // there is one idle connection now
      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(pool.getIdleCount()).toBe(1);

      // request the idle connection
      const connection2 = await pool.request();
      expect(connection2).toBeInstanceOf(MegaPoolConnection);

      // makes sure the retry is triggered
      expect(Echo.retry).toHaveBeenCalledTimes(1);

      // make sure the retry succeed from the first try
      expect(MySQLConn.close).toHaveBeenCalledTimes(2);

      // a new connection is created after the dead connection is closed
      expect(driver.createConnection).toHaveBeenCalledTimes(2);

      // clean up
      connection2.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should fail to close a dead idle connection, retry but fail again, and reject", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      // make sure the all connections are dead
      MySQLConn.isAlive = jest.fn(() => Promise.reject());

      // make sure closing fail
      MySQLConn.close = jest.fn(() => Promise.reject());

      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      // enable retry
      const pool = new MegaPool({}, { shouldRetry: true }, driver);

      // create an idle connections
      const connection1 = await pool.request();
      connection1.release();

      // there is one idle connection now
      expect(driver.createConnection).toHaveBeenCalledTimes(1);
      expect(pool.getIdleCount()).toBe(1);

      // request the idle connection
      await expect(pool.request()).rejects.toBeInstanceOf(CloseConnectionError);

      // makes sure the retry is triggered
      expect(Echo.retry).toHaveBeenCalledTimes(1);

      // make sure the retry rejects after 3 retries + 1 initial try
      expect(MySQLConn.close).toHaveBeenCalledTimes(4);

      // clean up
      expect(await pool.shutdown()).resolves;
    });

    it("should close idle connections after MaxIdleTime and succeed", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      MySQLConn.isAlive = jest.fn(() => Promise.resolve());

      MySQLConn.close = jest.fn(() => Promise.resolve());

      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      // enable retry
      const pool = new MegaPool(
        {},
        { shouldRetry: false, maxIdleTime: 1000 },
        driver
      );

      const action = jest.fn();

      pool.on("CloseSuccess", action);
      jest.useFakeTimers();

      const connection1 = await pool.request();
      const connection2 = await pool.request();
      const connection3 = await pool.request();
      connection1.release();
      connection2.release();
      connection3.release();

      // make sure we have an idle connection
      expect(pool.getIdleCount()).toBe(3);

      // after 1s (MaxIdleTime) connection is closed
      jest.advanceTimersByTime(1000);

      // Ensure all timers are executed
      jest.runAllTimers();

      new Promise(setImmediate).then(() => {
        // Make assertions
        expect(pool.getIdleCount()).toBe(0);
        expect(action).toHaveBeenCalledTimes(3);
      });
    });

    it("should close idle connections after MaxIdleTime and fail", async () => {
      const MySQLConn = new MySQLConnection({} as any);

      MySQLConn.isAlive = jest.fn(() => Promise.resolve());

      MySQLConn.close = jest.fn(() => Promise.reject());

      (driver.createConnection as jest.Mock).mockResolvedValue(MySQLConn);

      // enable retry
      const pool = new MegaPool(
        {},
        { shouldRetry: false, maxIdleTime: 1000 },
        driver
      );

      const action = jest.fn();

      pool.on("CloseFail", action);
      jest.useFakeTimers();

      const connection1 = await pool.request();
      const connection2 = await pool.request();
      const connection3 = await pool.request();

      connection1.release();
      connection2.release();
      connection3.release();

      // make sure we have an idle connection
      expect(pool.getIdleCount()).toBe(3);

      // after 1s (MaxIdleTime) connection is closed
      jest.advanceTimersByTime(1000);

      // Ensure all timers are executed
      jest.runAllTimers();

      new Promise(setImmediate).then(() => {
        // Make assertions
        expect(pool.getIdleCount()).toBe(0);
        // idle connections could not be closed using the CloseFail
        expect(action).toHaveBeenCalledTimes(3);
        expect(pool.getErrors().length).toBe(3);
        expect(
          pool.getErrors().every((err) => err.name === "CloseConnectionError")
        ).toBe(true);
      });
    });
  });

  describe("Queue Connection Tests", () => {
    it("should queue connection requests and resolve when ever an idle connection is avaliable", async () => {
      (driver.createConnection as jest.Mock).mockResolvedValue(
        new MySQLConnection(undefined)
      );
      const pool = new MegaPool(
        {},
        { maxConnections: 1, shouldQueue: true, shouldRetry: false },
        driver
      );

      // request a connection
      const connection1 = await pool.request();

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(0);

      // request for another connection
      const connection2 = pool.request();

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(1);

      // make an idle connection avaliable
      connection1.release();

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(0);
    });

    it("should reject with MaxQueueTimeError if the connection requests are queued longer than MaxQueueTime option", async () => {
      (driver.createConnection as jest.Mock).mockResolvedValue(
        new MySQLConnection(undefined)
      );

      const pool = new MegaPool(
        {},
        {
          maxConnections: 1,
          shouldQueue: true,
          shouldRetry: false,
          maxQueueTime: 1000,
        },
        driver
      );

      const action = jest.fn();
      pool.on("MaxQueueTime", action);

      // request a connection
      const connection1 = await pool.request();

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(0);

      jest.useFakeTimers();

      // request for another connection
      pool.request().catch((error) => {
        expect(error).toBeInstanceOf(MaxQueueTimeError);
      });

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(1);

      // advance timers
      jest.advanceTimersByTime(1000);

      // register error check
      expect(pool.getErrors().length).toBe(1);
      expect(pool.getErrors()[0].name).toBe("MaxQueueTimeError");

      // emit event check
      expect(action).toHaveBeenCalledTimes(1);

      // clean up
      connection1.release();
      expect(await pool.shutdown()).resolves;
    });

    it("should reject with MaxQueueSizeError if the connection requests are more than the MaxQueueSize option", async () => {
      const pool = new MegaPool(
        {},
        {
          maxConnections: 1,
          shouldQueue: true,
          shouldRetry: false,
          maxQueueTime: 1000,
          maxQueueSize: 1,
        },
        driver
      );

      const action = jest.fn();
      pool.on("MaxQueueSize", action);

      // request a connection
      const connection1 = await pool.request();

      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(0);

      jest.useFakeTimers();

      // request for another connection
      const connection2 = pool.request();

      // now we have 1 aquired 1 request queued
      expect(pool.getAcquiredCount()).toBe(1);
      expect(pool.getRequestCount()).toBe(1);

      // request for another connection
      pool.request().catch((error) => {
        // we get a max queue size error
        // because the MaxQueueSize is 1
        expect(error).toBeInstanceOf(MaxQueueSizeError);
        // register error check
        expect(pool.getErrors().length).toBe(1);
        expect(pool.getErrors()[0].name).toBe("MaxQueueSizeError");

        // emit event check
        expect(action).toHaveBeenCalledTimes(1);
      });

      // if we release the connection1
      connection1.release();

      // now the connection2 is gonna be resloved
      connection2.then((connection) => {
        expect(connection).toBeInstanceOf(MegaPoolConnection);
        connection.release();
        expect(pool.shutdown()).resolves;
      });
    });
  });

  it("should reject with a MaxConnectionError the connection have been made by the pool are more than MaxConnections", async () => {
    const pool = new MegaPool(
      {},
      { shouldQueue: false, maxConnections: 1 },
      driver
    );

    const connection = await pool.request();

    expect(driver.createConnection).toHaveBeenCalledTimes(1);
    expect(pool.getAcquiredCount()).toBe(1);
    expect(pool.getIdleCount()).toBe(0);
    expect(pool.getRequestCount()).toBe(0);

    await expect(pool.request()).rejects.toBeInstanceOf(MaxConnectionError);
  });
});

describe("MegaPool.query", () => {
  it("should resolve", () => {
    const connection = new MySQLConnection(undefined);
    connection.query = jest.fn((): any => Promise.resolve("data"));
    (driver.createConnection as jest.Mock).mockResolvedValue(connection);
    const pool = new MegaPool({}, undefined, driver);
    const action = jest.fn();
    pool.on("QuerySuccess", action);
    pool.query("sql").then((data) => {
      expect(data).toBe("data");
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("data");
    });
  });

  it("should reject with a QueryFailError", async () => {
    const connection = new MySQLConnection(undefined);

    connection.query = jest.fn((): any => Promise.reject());
    (driver.createConnection as jest.Mock).mockResolvedValue(connection);

    const pool = new MegaPool({}, undefined, driver);
    const action = jest.fn();

    pool.on("QueryFail", action);

    pool.query("sql").catch((error) => {
      expect(error).toBeInstanceOf(QueryFailError);
      expect(error.message).toBe("Query execution failed");
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("Query execution failed");
    });
  });

  it("should reject with a CreateConnectionError", () => {
    (driver.createConnection as jest.Mock).mockRejectedValue(
      new Error("message")
    );

    const pool = new MegaPool({}, undefined, driver);
    const action = jest.fn();

    pool.on("CreateFail", action);

    pool.query("sql").catch((error) => {
      expect(error).toBeInstanceOf(CreateConnectionError);
      expect(error.message).toBe("message");
      expect(action).toHaveBeenCalledTimes(1);
      expect(action).toHaveBeenCalledWith("message");
    });
  });
  // it('should reject with a CloseConnectionError', () => {});
  // it('should reject with a MaxConnectionError', () => {});
  // it('should reject with a MaxQueueSizeError', () => {});
  // it('should reject with a MaxQueueTimeError', () => {});
});

describe("MegaPool.shutdown", () => {
  it("should close all idle connections and resolve", async () => {
    const connection = new MySQLConnection(undefined);
    (driver.createConnection as jest.Mock).mockResolvedValue(connection);
    const pool = new MegaPool({}, undefined, driver);
    const connection1 = await pool.request();
    const connection2 = await pool.request();
    expect(pool.getAcquiredCount()).toBe(2);
    expect(pool.getIdleCount()).toBe(0);
    connection1.release();
    connection2.release();
    expect(pool.getIdleCount()).toBe(2);
    expect(pool.getAcquiredCount()).toBe(0);
    // shutdown
    expect(await pool.shutdown()).resolves;
  });

  it("should reject if you dont release the connection", async () => {
    const connection = new MySQLConnection(undefined);
    (driver.createConnection as jest.Mock).mockResolvedValue(connection);
    const pool = new MegaPool({}, undefined, driver);
    const connection1 = await pool.request();
    const connection2 = await pool.request();
    expect(pool.getAcquiredCount()).toBe(2);
    expect(pool.getIdleCount()).toBe(0);
    // never relase the connections
    // shutdown
    try {
      await pool.shutdown();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
      expect((error as Error).message).toBe(
        `Make sure to release all the connections first`
      );
    }
    // now we relase the connections
    connection1.release();
    connection2.release();

    // now shutdown resolves
    expect(await pool.shutdown()).resolves;
  });

  it("should reject if a connection could not be closed", async () => {
    const connection = new MySQLConnection(undefined);
    connection.close = jest.fn(() => Promise.reject(new Error("message")));
    (driver.createConnection as jest.Mock).mockResolvedValue(connection);
    const pool = new MegaPool({}, { shouldRetry: false }, driver);
    const brokenConnections: Array<MySQLConnection> = [];
    // handle closing rejections
    const action = jest.fn((connection: MySQLConnection) => {
      brokenConnections.push(connection);
    });
    pool.on("CloseFail", action);
    const connection1 = await pool.request();
    const connection2 = await pool.request();
    connection1.release();
    connection2.release();
    // shutdown
    try {
      await pool.shutdown();
    } catch (error) {
      expect(error).toBeInstanceOf(CloseConnectionError);
      expect((error as Error).message).toBe("message");
      expect(action).toHaveBeenCalledTimes(2);
      connection.close = jest.fn(() => Promise.resolve());
      brokenConnections.forEach(async (connection) => {
        expect(await connection.close()).resolves;
      });
    }
  });

  it("should not perform any farther operations while shutdown procecss", async () => {
    const connection = new MySQLConnection(undefined);
    connection.close = jest.fn(() => Promise.resolve());

    (driver.createConnection as jest.Mock).mockResolvedValue(connection);

    const pool = new MegaPool({}, { shouldRetry: false }, driver);

    const connection1 = await pool.request();
    const connection2 = await pool.request();
    connection1.release();
    connection2.release();

    // shutdown
    expect(await pool.shutdown()).resolves;

    try {
      await pool.request();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      await pool.query("sql");
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getErrors();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getPoolOptions();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getConnectionOptions();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getDriver();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getAcquiredCount();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getIdleCount();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.getRequestCount();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.hasAcquired();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }

    try {
      pool.hasIdle();
    } catch (error) {
      expect(error).toBeInstanceOf(MegaPoolError);
    }
  });
});

it("MegaPool.getErrors", () => {
  const pool = new MegaPool({}, undefined, driver);

  // should return pool errors
  expect(pool.getErrors().length).toBe(0);
});

it("MegaPool.getPoolOptions", () => {
  const pool = new MegaPool({}, { shouldRetry: false }, driver);

  // should return pool options
  expect(pool.getPoolOptions().shouldRetry).toBe(false);
});

it("MegaPool.getConnectionOptions", () => {
  const pool = new MegaPool({ user: "root" }, {}, driver);

  // should return connection options
  expect(pool.getConnectionOptions().user).toBe("root");
});

it("MegaPool.getDriver", () => {
  const pool = new MegaPool({}, {}, driver);

  // should return the driver
  expect(pool.getDriver()).toBeInstanceOf(MySQLDriver);
});

it("MegaPool.getAcquiredCount", () => {
  const pool = new MegaPool({}, {}, driver);

  // should return the acquired connections count
  expect(pool.getAcquiredCount()).toBe(0);
});

it("MegaPool.getIdleCount", () => {
  const pool = new MegaPool({}, {}, driver);

  // should return the idle connections count
  expect(pool.getIdleCount()).toBe(0);
});

it("MegaPool.getRequestCount", () => {
  const pool = new MegaPool({}, {}, driver);

  // should return the idle connections count
  expect(pool.getRequestCount()).toBe(0);
});

it("MegaPool.hasAcquired", () => {
  const pool = new MegaPool({}, {}, driver);

  // should tell if the pool has acquired connections
  expect(pool.hasAcquired()).toBe(false);
});

it("MegaPool.hasIdle", () => {
  const pool = new MegaPool({}, {}, driver);

  // should tell if the pool has idle connections
  expect(pool.hasIdle()).toBe(false);
});
