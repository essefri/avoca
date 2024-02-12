import { Stack } from './Stack';

type TypeText =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'null'
  | 'array';

export class Test {
  public static type(value: any): TypeText {
    if (value === null) return 'null';
    if (Test.isArray(value)) return 'array';
    if (Test.isObject(value)) return 'object';
    return typeof value;
  }

  public static isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  public static isObjectLike(value: any): boolean {
    return typeof value === 'object';
  }

  public static isEmptyObject(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length === 0
    );
  }

  public static isNonEmptyObject(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length > 0
    );
  }

  public static isObjectLiteral(value: any) {
    return (
      value !== null &&
      typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  public static ownProp(object: object, property: string): boolean {
    if (!Test.isObject(object)) return false;
    if (!Test.isText(property)) return false;

    return object.hasOwnProperty(property);
  }

  public static ownProps(object: object, properties: string[]): boolean {
    if (!Test.isObject(object)) return false;
    if (!Test.isNonEmptyArray(properties)) return false;

    return properties.every((propert) => object.hasOwnProperty(propert));
  }

  public static hasProp(object: object, property: string): boolean {
    if (!Test.isObject(object)) return false;
    if (!Test.isText(property)) return false;

    return Object.keys(object).includes(property);
  }

  public static hasProps(object: object, properties: string[]): boolean {
    if (!Test.isObject(object)) return false;
    if (!Test.isArray(properties)) return false;

    return properties.every((property) =>
      Object.keys(object).includes(property)
    );
  }

  public static hasLength(
    target: Object | Array<any> | string,
    length: number
  ): boolean {
    if (
      Test.isInteger(length) &&
      (Test.isText(target) || Test.isArray(target) || Test.isObject(target))
    ) {
      if (Test.isObject(target)) return Object.keys(target).length === length;
      if (Test.isText(target)) return (target as string).length === length;
      if (Test.isArray(target)) return (target as Array<any>).length === length;
    }

    return false;
  }

  public static isArray(value: any): boolean {
    return Array.isArray(value);
  }

  public static isEmptyArray(value: any): boolean {
    return Array.isArray(value) && value.length === 0;
  }

  public static isNonEmptyArray(value: any): boolean {
    return Array.isArray(value) && value.length > 0;
  }

  public static isIterable(value: any): boolean {
    return Symbol.iterator in Object(value);
  }

  public static isFirstIteration(index: number): boolean {
    if (!Test.isInteger(index)) return false;
    return index === 0;
  }

  public static isLastIteration(array: Array<any>, index: number) {
    if (!Test.isInteger(index)) return false;

    if (!Test.isArray(array)) return false;

    return array.length === index + 1;
  }

  public static hasIndex(target: Array<any> | string, index: number) {
    if (
      Test.isInteger(index) &&
      (Test.isArray(target) || Test.isText(target))
    ) {
      return index >= 0 && index < target.length;
    }

    return false;
  }

  // Number Check
  public static isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  public static isInteger(value: any) {
    return Number.isFinite(value) && Number.isInteger(value);
  }

  public static isFloat(value: any) {
    return Number.isFinite(value) && !Number.isInteger(value);
  }

  public static isEven(value: number): boolean {
    if (!Test.isNumber(value)) return false;

    return value % 2 === 0;
  }

  public static isOdd(value: number): boolean {
    if (!Test.isNumber(value)) return false;

    return value % 2 !== 0;
  }

  public static isBetween(number: number, min: number, max: number): boolean {
    if (!Test.isNumber(number) || !Test.isNumber(min) || !Test.isNumber(max))
      return false;
    return number <= max && number >= min;
  }

  public static isBetweenStrict(
    number: number,
    min: number,
    max: number
  ): boolean {
    if (!Test.isNumber(number) || !Test.isNumber(min) || !Test.isNumber(max))
      return false;

    return number < max && number > min;
  }

  public static isLessThan(compare: number, to: number): boolean {
    if (!Test.isNumber(compare) || !Test.isNumber(to)) return false;

    return compare < to;
  }

  public static isLessThanOrEqual(compare: number, to: number): boolean {
    if (!Test.isNumber(compare) || !Test.isNumber(to)) return false;

    return compare <= to;
  }

  public static isGreaterThan(compare: number, to: number): boolean {
    if (!Test.isNumber(compare) || !Test.isNumber(to)) return false;

    return compare > to;
  }

  public static isGreaterThanOrEqual(compare: number, to: number): boolean {
    if (!Test.isNumber(compare) || !Test.isNumber(to)) return false;

    return compare >= to;
  }

  public static isNegativeInfinity(value: any): boolean {
    return value === -Infinity;
  }

  public static isInfinity(value: any): boolean {
    return value === Infinity;
  }

  public static isFinite(value: any): boolean {
    return Number.isFinite(value);
  }

  // Function Checks
  public static isFunction(value: any): boolean {
    return typeof value === 'function';
  }

  public static isAsyncFunction(value: any): boolean {
    return (
      Test.isFunction(value) &&
      value.constructor &&
      value.constructor.name === 'AsyncFunction'
    );
  }

  public static isText(value: any): boolean {
    return typeof value === 'string';
  }

  public static isEmptyText(value: any): boolean {
    return Test.isText(value) && value.trim().length === 0;
  }

  public static isNonEmptyText(value: any): boolean {
    return Test.isText(value) && value.trim().length > 0;
  }

  // Boolean Checks
  public static isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }

  public static isTruthy(value: any): boolean {
    return !!value;
  }

  public static isFalsy(value: any): boolean {
    return !value;
  }

  // Null and Undefined Checks
  public static isNull(value: any): boolean {
    return value === null;
  }

  public static isUndefined(value: any): boolean {
    return value === undefined;
  }

  public static isDefined(value: any): boolean {
    return value !== undefined;
  }

  public static isDefinedStrict(value: any): boolean {
    return value !== undefined && value !== null;
  }

  // Promise Check
  public static isPromise(value: any): boolean {
    return value instanceof Promise;
  }

  // Date Check
  public static isDate(value: any): boolean {
    return value instanceof Date;
  }

  // Map Check
  public static isMap(value: any): boolean {
    return value instanceof Map;
  }

  // Stack Check
  public static isStack(value: any): boolean {
    return value instanceof Stack;
  }

  // RegExp Check
  public static isRegExp(value: any): boolean {
    return value instanceof RegExp;
  }

  public static hasFlag(regex: RegExp, flag: string): boolean {
    if (!Test.isText(flag)) return false;
    if (!Test.isRegExp(regex)) return false;
    return regex.flags.includes(flag);
  }

  // Expression Checks
  public static _isPropName(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^(?:[a-z_$][a-z0-9_$]*)$/i.test(expression);
  }

  public static _isNumber(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^(?:[0-9]+(?:\.[0-9]+)?)$/.test(expression);
  }

  public static _isInteger(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^(?:[0-9]+)$/.test(expression);
  }

  public static _isFloat(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^(?:[0-9]+\.[0-9]+)$/.test(expression);
  }

  public static _isText(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^(?:'[^']*'|"[^"]*")$/.test(expression);
  }

  public static _isDot(expression: string): boolean {
    if (!Test.isText(expression)) return false;
    return /^([a-z_$][a-z0-9_$]*(?:\.[a-z_$][a-z0-9_$]*)*)$/.test(expression);
  }

  public static _isBracket(expression: string): boolean {
    if (!Test.isText(expression)) return false;

    return /^([a-zA-Z_\$][a-zAZ0-9_\$]*(?:\[['"].*['"]\]|\[[0-9]+\])*)$/.test(
      expression
    );
  }

  public static _isNotation(expression: string): boolean {
    if (!Test.isText(expression)) return false;
    return /^((?:[a-z_$][a-z0-9_$]*)(?:\[[0-9]+\]|\[["'].*["']\])*)(\.(?:[a-z_$][a-z0-9_$]*)(?:\[[0-9]+\]|\[["'].*["']\])*)*$/i.test(
      expression
    );
  }

  // Encoding Check
  public static isEncoding(value: string): boolean {
    if (!Test.isText(value)) return false;

    return [
      'ascii',
      'utf8',
      'utf-8',
      'utf16le',
      'ucs2',
      'ucs-2',
      'base64',
      'base64url',
      'latin1',
      'binary',
      'hex',
    ].includes(value);
  }

  // Class and Instance Checks
  public static isClass(value: any): boolean {
    return typeof value === 'function' && value.toString().startsWith('class ');
  }

  public static isChildOf(child: any, parent: any): boolean {
    return child instanceof parent;
  }

  public static isError(value: any, type?: any): boolean {
    if (Test.isDefined(type)) {
      return value instanceof type;
    }

    return value instanceof Error;
  }

  // are

  public static areFunctions(...values: Array<any>): boolean {
    for (let $index = 0; $index < values.length; $index++) {
      const value = values[$index];
      if (!Test.isFunction(value)) return false;
    }

    return true;
  }

  public static areDefined(...values: Array<any>): boolean {
    for (let $index = 0; $index < values.length; $index++) {
      const value = values[$index];
      if (value === undefined) return false;
    }

    return true;
  }
}
