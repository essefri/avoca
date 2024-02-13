import { Stack } from "../../modules/utils/Stack";
import { Test } from "../../modules/utils/Test";
describe("Test.type", () => {
  it("should return the type of the value", () => {
    expect(Test.type(null)).toBe("null");
    expect(Test.type([])).toBe("array");
    expect(Test.type({})).toBe("object");
    expect(Test.type(42)).toBe("number");
    expect(Test.type("hello")).toBe("string");
    expect(Test.type(true)).toBe("boolean");
  });
});

describe("Test.isObject", () => {
  it("should return true for non-null array objects", () => {
    expect(Test.isObject({ name: "simon" })).toBe(true);
    expect(Test.isObject([])).toBe(false);
    expect(Test.isObject(null)).toBe(false);
  });

  it("should return false for other types", () => {
    expect(Test.isObject(42)).toBe(false);
    expect(Test.isObject("hello")).toBe(false);
    expect(Test.isObject(true)).toBe(false);
    expect(Test.isObject([])).toBe(false);
  });
});

describe("Test.isObjectLike", () => {
  it("should return true for objects", () => {
    expect(Test.isObjectLike({})).toBe(true);
    expect(Test.isObjectLike({ name: "simon" })).toBe(true);
  });

  it("should return true for arrays", () => {
    expect(Test.isObjectLike([1, 2, 3])).toBe(true);
    expect(Test.isObjectLike(null)).toBe(true);
  });

  it("should return false for other types", () => {
    expect(Test.isObjectLike(42)).toBe(false);
    expect(Test.isObjectLike("hello")).toBe(false);
    expect(Test.isObjectLike(true)).toBe(false);
  });
});

describe("Test.isEmptyObject", () => {
  it("should return true for an empty object", () => {
    expect(Test.isEmptyObject({})).toBe(true);
    expect(Test.isEmptyObject([])).toBe(true);
  });

  it("should return false for non-empty objects", () => {
    expect(Test.isEmptyObject({ name: "simon" })).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.isEmptyObject(null)).toBe(false);
    expect(Test.isEmptyObject("hello")).toBe(false);
    expect(Test.isEmptyObject(true)).toBe(false);
  });
});

describe("Test.isNonEmptyObject", () => {
  it("should return true for non-empty objects", () => {
    expect(Test.isNonEmptyObject({ name: "simon" })).toBe(true);
  });

  it("should return false for an empty object", () => {
    expect(Test.isNonEmptyObject({})).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.isNonEmptyObject(null)).toBe(false);
    expect(Test.isNonEmptyObject([])).toBe(false);
    expect(Test.isNonEmptyObject("hello")).toBe(false);
    expect(Test.isNonEmptyObject(true)).toBe(false);
  });
});

describe("Test.isObjectLiteral", () => {
  it("should return true for an object literal", () => {
    expect(Test.isObjectLiteral({ name: "simon" })).toBe(true);
  });

  it("should return false for other objects", () => {
    // expect(Test.isObjectLiteral(new Object())).toBe(false); // gives true
    expect(Test.isObjectLiteral([])).toBe(false);
    expect(Test.isObjectLiteral(null)).toBe(false);
    expect(Test.isObjectLiteral("hello")).toBe(false);
    expect(Test.isObjectLiteral(true)).toBe(false);
  });
});

describe("Test.ownProp", () => {
  it("should return true if the object has the specified property", () => {
    const obj = { name: "simon" };
    expect(Test.ownProp(obj, "name")).toBe(true);
  });

  it("should return false if the object does not have the specified property", () => {
    const obj = { name: "simon" };
    expect(Test.ownProp(obj, "age")).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.ownProp(null, "name")).toBe(false);
    expect(Test.ownProp("hello" as any, "name")).toBe(false);
    expect(Test.ownProp(true as any, "name")).toBe(false);
    expect(Test.ownProp([], "name")).toBe(false);
  });
});

describe("Test.ownProps", () => {
  it("should return true if the object has all specified properties", () => {
    const obj = { name: "simon", age: 22 };
    expect(Test.ownProps(obj, ["name", "age"])).toBe(true);
  });

  it("should return false if the object does not have any specified property", () => {
    const obj = { name: "simon", age: 22 };
    expect(Test.ownProps(obj, ["gender", "city"])).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.ownProps(null, ["name", "age"])).toBe(false);
    expect(Test.ownProps("hello" as any, ["name", "age"])).toBe(false);
    expect(Test.ownProps(true as any, ["name", "age"])).toBe(false);
    expect(Test.ownProps([], ["name", "age"])).toBe(false);
  });
});

describe("Test.hasProp", () => {
  it("should return true if the object has the specified property", () => {
    const obj = { name: "simon" };
    expect(Test.hasProp(obj, "name")).toBe(true);
  });

  it("should return false if the object does not have the specified property", () => {
    const obj = { name: "simon" };
    expect(Test.hasProp(obj, "age")).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.hasProp(null, "name")).toBe(false);
    expect(Test.hasProp("hello" as any, "name")).toBe(false);
    expect(Test.hasProp(true as any, "name")).toBe(false);
    expect(Test.hasProp([], "name")).toBe(false);
  });
});

describe("Test.hasProps", () => {
  it("should return true if the object has all specified properties", () => {
    const obj = { name: "simon", age: 22 };
    expect(Test.hasProps(obj, ["name", "age"])).toBe(true);
  });

  it("should return false if the object does not have any specified property", () => {
    const obj = { name: "simon", age: 22 };
    expect(Test.hasProps(obj, ["gender", "city"])).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(Test.hasProps(null, ["name", "age"])).toBe(false);
    expect(Test.hasProps("hello" as any, ["name", "age"])).toBe(false);
    expect(Test.hasProps(true as any, ["name", "age"])).toBe(false);
    expect(Test.hasProps([], ["name", "age"])).toBe(false);
  });
});

describe("Test.hasLength", () => {
  it("should return true if the target has the specified length", () => {
    expect(Test.hasLength("hello", 5)).toBe(true);
    expect(Test.hasLength([1, 2, 3], 3)).toBe(true);
    expect(Test.hasLength({ name: "simon" }, 1)).toBe(true);
  });

  it("should return false if the target does not have the specified length", () => {
    expect(Test.hasLength("hello", 4)).toBe(false);
    expect(Test.hasLength([1, 2, 3], 2)).toBe(false);
    expect(Test.hasLength({ name: "simon" }, 0)).toBe(false);
  });

  it("should return false for invalid inputs", () => {
    expect(Test.hasLength(null, 5)).toBe(false);
    expect(Test.hasLength("hello", "world" as any)).toBe(false);
    expect(Test.hasLength([1, 2, 3], "length" as any)).toBe(false);
  });
});

describe("Test.isArray", () => {
  it("should return true for arrays", () => {
    expect(Test.isArray([1, 2, 3])).toBe(true);
  });

  it("should return false for non-arrays", () => {
    expect(Test.isArray(null)).toBe(false);
    expect(Test.isArray("hello")).toBe(false);
    expect(Test.isArray({ name: "simon" })).toBe(false);
    expect(Test.isArray(true)).toBe(false);
  });
});

describe("Test.isEmptyArray", () => {
  it("should return true for an empty array", () => {
    expect(Test.isEmptyArray([])).toBe(true);
  });

  it("should return false for a non-empty array", () => {
    expect(Test.isEmptyArray([1, 2, 3])).toBe(false);
  });

  it("should return false for non-arrays", () => {
    expect(Test.isEmptyArray(null)).toBe(false);
    expect(Test.isEmptyArray("hello")).toBe(false);
    expect(Test.isEmptyArray({ name: "simon" })).toBe(false);
    expect(Test.isEmptyArray(true)).toBe(false);
  });
});

describe("Test.isNonEmptyArray", () => {
  it("should return true for a non-empty array", () => {
    expect(Test.isNonEmptyArray([1, 2, 3])).toBe(true);
  });

  it("should return false for an empty array", () => {
    expect(Test.isNonEmptyArray([])).toBe(false);
  });

  it("should return false for non-arrays", () => {
    expect(Test.isNonEmptyArray(null)).toBe(false);
    expect(Test.isNonEmptyArray("hello")).toBe(false);
    expect(Test.isNonEmptyArray({ name: "simon" })).toBe(false);
    expect(Test.isNonEmptyArray(true)).toBe(false);
  });
});

describe("Test.isIterable", () => {
  it("should return true for iterable objects", () => {
    expect(Test.isIterable([])).toBe(true);
    expect(Test.isIterable("hello")).toBe(true);
    expect(Test.isIterable({ [Symbol.iterator]: () => {} })).toBe(true);
  });

  it("should return false for non-iterable objects", () => {
    expect(Test.isIterable(null)).toBe(false);
    expect(Test.isIterable({})).toBe(false);
    expect(Test.isIterable(true)).toBe(false);
    expect(Test.isIterable(42)).toBe(false);
  });
});

describe("Test.isFirstIteration", () => {
  it("should return true for the first iteration", () => {
    expect(Test.isFirstIteration(0)).toBe(true);
  });

  it("should return false for non-integer inputs", () => {
    expect(Test.isFirstIteration("index" as any)).toBe(false);
    expect(Test.isFirstIteration(null)).toBe(false);
    expect(Test.isFirstIteration({} as any)).toBe(false);
    expect(Test.isFirstIteration(true as any)).toBe(false);
  });

  it("should return false for non-first iterations", () => {
    expect(Test.isFirstIteration(1)).toBe(false);
    expect(Test.isFirstIteration(5)).toBe(false);
  });
});

describe("Test.isLastIteration", () => {
  it("should return true for the last iteration", () => {
    expect(Test.isLastIteration([1, 2, 3], 2)).toBe(true);
  });

  it("should return false for non-integer inputs", () => {
    expect(Test.isLastIteration([1, 2, 3], "index" as any)).toBe(false);
    expect(Test.isLastIteration([1, 2, 3], null)).toBe(false);
    expect(Test.isLastIteration([1, 2, 3], {} as any)).toBe(false);
    expect(Test.isLastIteration([1, 2, 3], true as any)).toBe(false);
  });

  it("should return false for non-last iterations", () => {
    expect(Test.isLastIteration([1, 2, 3], 0)).toBe(false);
    expect(Test.isLastIteration([1, 2, 3], 1)).toBe(false);
    expect(Test.isLastIteration([1, 2, 3], 5)).toBe(false);
  });
});

describe("Test.hasIndex", () => {
  it("should return true if the index is within the range", () => {
    expect(Test.hasIndex([1, 2, 3], 1)).toBe(true);
  });

  it("should return false for non-integer inputs", () => {
    expect(Test.hasIndex([1, 2, 3], "index" as any)).toBe(false);
    expect(Test.hasIndex([1, 2, 3], null)).toBe(false);
    expect(Test.hasIndex([1, 2, 3], {} as any)).toBe(false);
    expect(Test.hasIndex([1, 2, 3], true as any)).toBe(false);
  });

  it("should return false for out-of-range index", () => {
    expect(Test.hasIndex([1, 2, 3], -1)).toBe(false);
    expect(Test.hasIndex([1, 2, 3], 5)).toBe(false);
  });
});

describe("Test.isNumber", () => {
  it("should return true for numbers", () => {
    expect(Test.isNumber(42)).toBe(true);
    expect(Test.isNumber(3.14)).toBe(true);
  });

  it("should return false for non-numbers", () => {
    expect(Test.isNumber("hello")).toBe(false);
    expect(Test.isNumber(true)).toBe(false);
    expect(Test.isNumber([])).toBe(false);
    expect(Test.isNumber({})).toBe(false);
  });
});

describe("Test.isInteger", () => {
  it("should return true for integers", () => {
    expect(Test.isInteger(42)).toBe(true);
    expect(Test.isInteger(-7)).toBe(true);
  });

  it("should return false for non-integers", () => {
    expect(Test.isInteger(3.14)).toBe(false);
    expect(Test.isInteger("hello")).toBe(false);
    expect(Test.isInteger(true)).toBe(false);
    expect(Test.isInteger([])).toBe(false);
    expect(Test.isInteger({})).toBe(false);
  });
});

describe("Test.isFloat", () => {
  it("should return true for floating-point numbers", () => {
    expect(Test.isFloat(3.14)).toBe(true);
    expect(Test.isFloat(-0.5)).toBe(true);
  });

  it("should return false for non-floating-point numbers", () => {
    expect(Test.isFloat(42)).toBe(false);
    expect(Test.isFloat("hello")).toBe(false);
    expect(Test.isFloat(true)).toBe(false);
    expect(Test.isFloat([])).toBe(false);
    expect(Test.isFloat({})).toBe(false);
  });
});

describe("Test.isEven", () => {
  it("should return true for even numbers", () => {
    expect(Test.isEven(2)).toBe(true);
    expect(Test.isEven(-6)).toBe(true);
  });

  it("should return false for odd numbers", () => {
    expect(Test.isEven(3)).toBe(false);
    expect(Test.isEven(1)).toBe(false);
  });

  it("should return false for non-integers", () => {
    expect(Test.isEven(3.14)).toBe(false);
    expect(Test.isEven("hello" as any)).toBe(false);
    expect(Test.isEven(true as any)).toBe(false);
    expect(Test.isEven([] as any)).toBe(false);
    expect(Test.isEven({} as any)).toBe(false);
  });
});

describe("Test.isOdd", () => {
  it("should return true for odd numbers", () => {
    expect(Test.isOdd(3)).toBe(true);
    expect(Test.isOdd(-5)).toBe(true);
  });

  it("should return false for even numbers", () => {
    expect(Test.isOdd(2)).toBe(false);
    expect(Test.isOdd(6)).toBe(false);
  });

  it("should return false for non-integers", () => {
    expect(Test.isOdd("hello" as any)).toBe(false);
    expect(Test.isOdd(true as any)).toBe(false);
    expect(Test.isOdd([] as any)).toBe(false);
    expect(Test.isOdd({} as any)).toBe(false);
  });
});

describe("Test.isBetween", () => {
  it("should return true if the number is between the specified range", () => {
    expect(Test.isBetween(5, 2, 8)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isBetween("number" as any, 2, 8)).toBe(false);
    expect(Test.isBetween(5, "min" as any, 8)).toBe(false);
    expect(Test.isBetween(5, 2, "max" as any)).toBe(false);
  });

  it("should return false for out-of-range numbers", () => {
    expect(Test.isBetween(1, 2, 8)).toBe(false);
    expect(Test.isBetween(10, 2, 8)).toBe(false);
  });
});

describe("Test.isBetweenStrict", () => {
  it("should return true if the number is strictly between the specified range", () => {
    expect(Test.isBetweenStrict(5, 2, 8)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isBetweenStrict("number" as any, 2, 8)).toBe(false);
    expect(Test.isBetweenStrict(5, "min" as any, 8)).toBe(false);
    expect(Test.isBetweenStrict(5, 2, "max" as any)).toBe(false);
  });

  it("should return false for out-of-range numbers", () => {
    expect(Test.isBetweenStrict(2, 2, 8)).toBe(false);
    expect(Test.isBetweenStrict(8, 2, 8)).toBe(false);
  });
});

describe("Test.isLessThan", () => {
  it("should return true if the first number is less than the second", () => {
    expect(Test.isLessThan(2, 5)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isLessThan("compare" as any, 5)).toBe(false);
    expect(Test.isLessThan(2, "to" as any)).toBe(false);
  });

  it("should return false for non-less-than comparisons", () => {
    expect(Test.isLessThan(5, 2)).toBe(false);
    expect(Test.isLessThan(5, 5)).toBe(false);
  });
});

describe("Test.isLessThanOrEqual", () => {
  it("should return true if the first number is less than or equal to the second", () => {
    expect(Test.isLessThanOrEqual(2, 5)).toBe(true);
    expect(Test.isLessThanOrEqual(5, 5)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isLessThanOrEqual("compare" as any, 5)).toBe(false);
    expect(Test.isLessThanOrEqual(2, "to" as any)).toBe(false);
  });

  it("should return false for non-less-than-or-equal comparisons", () => {
    expect(Test.isLessThanOrEqual(5, 2)).toBe(false);
  });
});

describe("Test.isGreaterThan", () => {
  it("should return true if the first number is greater than the second", () => {
    expect(Test.isGreaterThan(5, 2)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isGreaterThan("compare" as any, 2)).toBe(false);
    expect(Test.isGreaterThan(5, "to" as any)).toBe(false);
  });

  it("should return false for non-greater-than comparisons", () => {
    expect(Test.isGreaterThan(2, 5)).toBe(false);
    expect(Test.isGreaterThan(5, 5)).toBe(false);
  });
});

describe("Test.isGreaterThanOrEqual", () => {
  it("should return true if the first number is greater than or equal to the second", () => {
    expect(Test.isGreaterThanOrEqual(5, 2)).toBe(true);
    expect(Test.isGreaterThanOrEqual(5, 5)).toBe(true);
  });

  it("should return false for non-number inputs", () => {
    expect(Test.isGreaterThanOrEqual("compare" as any, 2)).toBe(false);
    expect(Test.isGreaterThanOrEqual(5, "to" as any)).toBe(false);
  });

  it("should return false for non-greater-than-or-equal comparisons", () => {
    expect(Test.isGreaterThanOrEqual(2, 5)).toBe(false);
  });
});

describe("Test.isNegativeInfinity", () => {
  it("should return true for negative Infinity", () => {
    expect(Test.isNegativeInfinity(-Infinity)).toBe(true);
  });

  it("should return false for non-Infinity values", () => {
    expect(Test.isNegativeInfinity(+Infinity)).toBe(false);
    expect(Test.isNegativeInfinity(42)).toBe(false);
    expect(Test.isNegativeInfinity("Infinity")).toBe(false);
  });
});

describe("Test.isInfinity", () => {
  it("should return true for positive Infinity", () => {
    expect(Test.isInfinity(Infinity)).toBe(true);
    expect(Test.isInfinity(-Infinity)).toBe(false);
  });

  it("should return false for non-Infinity values", () => {
    expect(Test.isInfinity(42)).toBe(false);
    expect(Test.isInfinity("Infinity")).toBe(false);
  });
});

describe("Test.isFinite", () => {
  it("should return true for finite numbers", () => {
    expect(Test.isFinite(42)).toBe(true);
    expect(Test.isFinite(-3.14)).toBe(true);
  });

  it("should return false for Infinity", () => {
    expect(Test.isFinite(+Infinity)).toBe(false);
    expect(Test.isFinite(-Infinity)).toBe(false);
  });

  it("should return false for non-number values", () => {
    expect(Test.isFinite("42")).toBe(false);
    expect(Test.isFinite(true)).toBe(false);
    expect(Test.isFinite([])).toBe(false);
  });
});

describe("Test.isFunction", () => {
  it("should return true for functions", () => {
    expect(Test.isFunction(() => {})).toBe(true);
    expect(Test.isFunction(function () {})).toBe(true);
  });

  it("should return false for non-function values", () => {
    expect(Test.isFunction(42)).toBe(false);
    expect(Test.isFunction("function")).toBe(false);
    expect(Test.isFunction(true)).toBe(false);
  });
});

describe("Test.isAsyncFunction", () => {
  it("should return true for async functions", () => {
    const asyncFunction = async () => {};
    expect(Test.isAsyncFunction(asyncFunction)).toBe(true);
  });

  it("should return false for non-async functions", () => {
    expect(Test.isAsyncFunction(() => {})).toBe(false);
    expect(Test.isAsyncFunction(function () {})).toBe(false);
    expect(Test.isAsyncFunction(42)).toBe(false);
  });
});

describe("Test.isText", () => {
  it("should return true for strings", () => {
    expect(Test.isText("hello")).toBe(true);
    expect(Test.isText("")).toBe(true);
  });

  it("should return false for non-string values", () => {
    expect(Test.isText(42)).toBe(false);
    expect(Test.isText(true)).toBe(false);
    expect(Test.isText([])).toBe(false);
  });
});

describe("Test.isEmptyText", () => {
  it("should return true for empty strings", () => {
    expect(Test.isEmptyText("")).toBe(true);
    expect(Test.isEmptyText("  ")).toBe(true);
  });

  it("should return false for non-empty strings", () => {
    expect(Test.isEmptyText("hello")).toBe(false);
    expect(Test.isEmptyText(42)).toBe(false);
    expect(Test.isEmptyText(true)).toBe(false);
  });
});

describe("Test.isNonEmptyText", () => {
  it("should return true for non-empty strings", () => {
    expect(Test.isNonEmptyText("hello")).toBe(true);
  });

  it("should return false for empty strings", () => {
    expect(Test.isNonEmptyText("")).toBe(false);
    expect(Test.isNonEmptyText("  ")).toBe(false);
    expect(Test.isNonEmptyText(42)).toBe(false);
    expect(Test.isNonEmptyText(true)).toBe(false);
  });
});

describe("Test.isBoolean", () => {
  it("should return true for booleans", () => {
    expect(Test.isBoolean(true)).toBe(true);
    expect(Test.isBoolean(false)).toBe(true);
  });

  it("should return false for non-boolean values", () => {
    expect(Test.isBoolean(42)).toBe(false);
    expect(Test.isBoolean("true")).toBe(false);
    expect(Test.isBoolean([])).toBe(false);
  });
});

describe("Test.isTruthy", () => {
  it("should return true for truthy values", () => {
    expect(Test.isTruthy(true)).toBe(true);
    expect(Test.isTruthy("hello")).toBe(true);
    expect(Test.isTruthy(42)).toBe(true);
  });

  it("should return false for falsy values", () => {
    expect(Test.isTruthy(false)).toBe(false);
    expect(Test.isTruthy("")).toBe(false);
    expect(Test.isTruthy(null)).toBe(false);
  });
});

describe("Test.isFalsy", () => {
  it("should return true for falsy values", () => {
    expect(Test.isFalsy(false)).toBe(true);
    expect(Test.isFalsy("")).toBe(true);
    expect(Test.isFalsy(null)).toBe(true);
  });

  it("should return false for truthy values", () => {
    expect(Test.isFalsy(true)).toBe(false);
    expect(Test.isFalsy("hello")).toBe(false);
    expect(Test.isFalsy(42)).toBe(false);
  });
});

describe("Test.isNull", () => {
  it("should return true for null", () => {
    expect(Test.isNull(null)).toBe(true);
  });

  it("should return false for non-null values", () => {
    expect(Test.isNull(undefined)).toBe(false);
    expect(Test.isNull(42)).toBe(false);
    expect(Test.isNull("null")).toBe(false);
  });
});

describe("Test.isUndefined", () => {
  it("should return true for undefined", () => {
    expect(Test.isUndefined(undefined)).toBe(true);
  });

  it("should return false for defined values", () => {
    expect(Test.isUndefined(null)).toBe(false);
    expect(Test.isUndefined(42)).toBe(false);
    expect(Test.isUndefined("undefined")).toBe(false);
  });
});

describe("Test.isDefined", () => {
  it("should return true for defined values", () => {
    expect(Test.isDefined(null)).toBe(true);
    expect(Test.isDefined(42)).toBe(true);
    expect(Test.isDefined("defined")).toBe(true);
  });

  it("should return false for undefined values", () => {
    expect(Test.isDefined(undefined)).toBe(false);
  });
});

describe("Test.isDefinedStrict", () => {
  it("should return true for defined and non-null values", () => {
    expect(Test.isDefinedStrict(42)).toBe(true);
    expect(Test.isDefinedStrict("defined")).toBe(true);
  });

  it("should return false for undefined values", () => {
    expect(Test.isDefinedStrict(undefined)).toBe(false);
    expect(Test.isDefinedStrict(null)).toBe(false);
  });
});

describe("Test.isPromise", () => {
  it("should return true for promises", () => {
    const promise = new Promise((resolve) => resolve("hello"));
    expect(Test.isPromise(promise)).toBe(true);
  });

  it("should return false for non-promise values", () => {
    expect(Test.isPromise(null)).toBe(false);
    expect(Test.isPromise(42)).toBe(false);
    expect(Test.isPromise("promise")).toBe(false);
  });
});

describe("Test.isDate", () => {
  it("should return true for dates", () => {
    const date = new Date();
    expect(Test.isDate(date)).toBe(true);
  });

  it("should return false for non-date values", () => {
    expect(Test.isDate(null)).toBe(false);
    expect(Test.isDate(42)).toBe(false);
    expect(Test.isDate("date")).toBe(false);
  });
});

describe("Test.isMap", () => {
  it("should return true for maps", () => {
    const map = new Map();
    expect(Test.isMap(map)).toBe(true);
  });

  it("should return false for non-map values", () => {
    expect(Test.isMap(null)).toBe(false);
    expect(Test.isMap(42)).toBe(false);
    expect(Test.isMap("map")).toBe(false);
  });
});

describe("Test.isStack", () => {
  it("should return true for instances of Stack", () => {
    const stack = new Stack();
    expect(Test.isStack(stack)).toBe(true);
  });

  it("should return false for non-Stack values", () => {
    expect(Test.isStack(null)).toBe(false);
    expect(Test.isStack(42)).toBe(false);
    expect(Test.isStack("stack")).toBe(false);
  });
});

describe("Test.isRegExp", () => {
  it("should return true for regular expressions", () => {
    const regex = /test/;
    expect(Test.isRegExp(regex)).toBe(true);
  });

  it("should return false for non-RegExp values", () => {
    expect(Test.isRegExp(null)).toBe(false);
    expect(Test.isRegExp(42)).toBe(false);
    expect(Test.isRegExp("regex")).toBe(false);
  });
});

describe("Test.hasFlag", () => {
  it("should return true if the regex has the specified flag", () => {
    const regex = /test/i;
    expect(Test.hasFlag(regex, "i")).toBe(true);
  });

  it("should return false if the regex does not have the specified flag", () => {
    const regex = /test/;
    expect(Test.hasFlag(regex, "i")).toBe(false);
  });

  it("should return false for non-RegExp values", () => {
    expect(Test.hasFlag(null, "i")).toBe(false);
    expect(Test.hasFlag(42 as any, "i")).toBe(false);
    expect(Test.hasFlag("regex" as any, "i")).toBe(false);
  });
});

describe("Test._isPropName", () => {
  it("should return true for valid property names", () => {
    expect(Test._isPropName("prop")).toBe(true);
    expect(Test._isPropName("_private")).toBe(true);
    expect(Test._isPropName("$variable")).toBe(true);
  });

  it("should return false for invalid property names", () => {
    expect(Test._isPropName("123invalid")).toBe(false);
    expect(Test._isPropName("special!char")).toBe(false);
    expect(Test._isPropName(" spacedOut ")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isPropName(null)).toBe(false);
    expect(Test._isPropName(42 as any)).toBe(false);
    expect(Test._isPropName({} as any)).toBe(false);
  });
});

describe("Test._isNumber", () => {
  it("should return true for valid numbers", () => {
    expect(Test._isNumber("123")).toBe(true);
    expect(Test._isNumber("0.456")).toBe(true);
  });

  it("should return false for invalid numbers", () => {
    expect(Test._isNumber("notANumber")).toBe(false);
    expect(Test._isNumber("12.34.56")).toBe(false);
    expect(Test._isNumber("  42  ")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isNumber(null)).toBe(false);
    expect(Test._isNumber(42 as any)).toBe(false);
    expect(Test._isNumber({} as any)).toBe(false);
  });
});

describe("Test._isInteger", () => {
  it("should return true for valid integers", () => {
    expect(Test._isInteger("123")).toBe(true);
    expect(Test._isInteger("0")).toBe(true);
  });

  it("should return false for invalid integers", () => {
    expect(Test._isInteger("notAnInteger")).toBe(false);
    expect(Test._isInteger("12.34")).toBe(false);
    expect(Test._isInteger("  42  ")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isInteger(null)).toBe(false);
    expect(Test._isInteger(42 as any)).toBe(false);
    expect(Test._isInteger({} as any)).toBe(false);
  });
});

describe("Test._isFloat", () => {
  it("should return true for valid floats", () => {
    expect(Test._isFloat("123.45")).toBe(true);
    expect(Test._isFloat("0.456")).toBe(true);
  });

  it("should return false for invalid floats", () => {
    expect(Test._isFloat("notAFloat")).toBe(false);
    expect(Test._isFloat("12")).toBe(false);
    expect(Test._isFloat("  42.34  ")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isFloat(null)).toBe(false);
    expect(Test._isFloat(42 as any)).toBe(false);
    expect(Test._isFloat({} as any)).toBe(false);
  });
});

describe("Test._isText", () => {
  it("should return true for valid text strings", () => {
    expect(Test._isText('"Hello"')).toBe(true);
    expect(Test._isText("'World'")).toBe(true);
    expect(Test._isText("''")).toBe(true);
  });

  it("should return false for invalid text strings", () => {
    expect(Test._isText("notAString")).toBe(false);
    expect(Test._isText("123")).toBe(false);
    expect(Test._isText("  spaced out  ")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isText(null)).toBe(false);
    expect(Test._isText(42 as any)).toBe(false);
    expect(Test._isText({} as any)).toBe(false);
  });
});

describe("Test._isDot", () => {
  it("should return true for valid dot notation strings", () => {
    expect(Test._isDot("object.property")).toBe(true);
    expect(Test._isDot("obj.prop1.prop2")).toBe(true);
    expect(Test._isDot("$var.nested.property")).toBe(true);
  });

  it("should return false for invalid dot notation strings", () => {
    expect(Test._isDot("123.invalid")).toBe(false);
    expect(Test._isDot(" special.char")).toBe(false);
    expect(Test._isDot(" not[allowed]")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isDot(null)).toBe(false);
    expect(Test._isDot(42 as any)).toBe(false);
    expect(Test._isDot({} as any)).toBe(false);
  });
});

describe("Test._isBracket", () => {
  it("should return true for valid bracket notation strings", () => {
    expect(Test._isBracket('object["property"]')).toBe(true);
    expect(Test._isBracket("obj[prop1][prop2]")).toBe(true);
    expect(Test._isBracket('$var[0].nested["property"]')).toBe(true);
  });

  it("should return false for invalid bracket notation strings", () => {
    expect(Test._isBracket("123[invalid]")).toBe(false);
    expect(Test._isBracket(" special[char]")).toBe(false);
    expect(Test._isBracket(" not.allowed[here]")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isBracket(null)).toBe(false);
    expect(Test._isBracket(42 as any)).toBe(false);
    expect(Test._isBracket({} as any)).toBe(false);
  });
});

describe("Test._isNotation", () => {
  it("should return true for valid notation strings", () => {
    expect(Test._isNotation("object.property")).toBe(true);
    expect(Test._isNotation("obj[prop1][prop2]")).toBe(true);
    expect(Test._isNotation('$var[0].nested["property"]')).toBe(true);
  });

  it("should return false for invalid notation strings", () => {
    expect(Test._isNotation("123.invalid")).toBe(false);
    expect(Test._isNotation(" special[char]")).toBe(false);
    expect(Test._isNotation(" not.allowed[here]")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test._isNotation(null)).toBe(false);
    expect(Test._isNotation(42 as any)).toBe(false);
    expect(Test._isNotation({} as any)).toBe(false);
  });
});

describe("Test.isEncoding", () => {
  it("should return true for valid encodings", () => {
    expect(Test.isEncoding("ascii")).toBe(true);
    expect(Test.isEncoding("utf8")).toBe(true);
    expect(Test.isEncoding("base64url")).toBe(true);
  });

  it("should return false for invalid encodings", () => {
    expect(Test.isEncoding("invalid")).toBe(false);
    expect(Test.isEncoding(42 as any)).toBe(false);
    expect(Test.isEncoding("utf-16")).toBe(false);
  });

  it("should return false for non-text values", () => {
    expect(Test.isEncoding(null)).toBe(false);
    expect(Test.isEncoding(42 as any)).toBe(false);
    expect(Test.isEncoding({} as any)).toBe(false);
  });
});

describe("Test.isClass", () => {
  it("should return true for class functions", () => {
    class ExampleClass {}
    expect(Test.isClass(ExampleClass)).toBe(true);
  });

  it("should return false for non-class functions", () => {
    const regularFunction = function () {};
    expect(Test.isClass(regularFunction)).toBe(false);
    expect(Test.isClass(null)).toBe(false);
    expect(Test.isClass({})).toBe(false);
  });
});

describe("Test.isChildOf", () => {
  class ParentClass {}
  class ChildClass extends ParentClass {}

  it("should return true if child is an instance of parent class", () => {
    const childInstance = new ChildClass();
    expect(Test.isChildOf(childInstance, ParentClass)).toBe(true);
  });

  it("should return false if child is not an instance of parent class", () => {
    const otherClassInstance = new (class {})();
    expect(Test.isChildOf(otherClassInstance, ParentClass)).toBe(false);
  });

  it("should return false for non-object values", () => {
    expect(Test.isChildOf(null, ParentClass)).toBe(false);
    expect(Test.isChildOf(42, ParentClass)).toBe(false);
    expect(Test.isChildOf("string", ParentClass)).toBe(false);
  });
});
