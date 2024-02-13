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

describe("MegaPool.request", () => {});

describe("MegaPool.query", () => {});

describe("MegaPool.shutdown", () => {});

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
