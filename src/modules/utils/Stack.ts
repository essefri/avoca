import { Test } from './Test';

import { StackError } from '../../errors/StackError';

type Item<T> = {
  key?: string;
  value: T;
};

type Items<T> = Array<Item<T>>;

type KeyItems<T> = { [key: string]: T };
type IndexItems<T> = Array<T>;

type ArrayShape<T> = Array<[string, T]>;
type ObjectShape<T> = {
  _anonymous?: Array<T>;
} & {
  [key: string]: T;
};

export class Stack<T> {
  private _items: Array<Item<T>>;

  constructor(items?: IndexItems<T> | KeyItems<T> | Items<T>) {
    if (
      !Test.isUndefined(items) &&
      !Test.isObject(items) &&
      !Test.isArray(items)
    ) {
      throw new StackError('Stack items must be an Array or Object');
    }

    this._items = [];

    !Test.isUndefined(items) && this.putMany(Infinity, items);
  }

  private compareFn(a: any, b: any, desc: boolean): number {
    const power = (value: any) => {
      if (Test.isObject(value)) return 1;
      if (Test.isFunction(value)) return 2;
      if (Test.isText(value)) return 3;
      if (Test.isNumber(value)) return 4;
      if (Test.isBoolean(value)) return 5;
      if (Test.isNull(value)) return 6;
      return 8; // all other types <undefined>
    };

    if (Test.isNumber(a) && Test.isNumber(b)) {
      return desc
        ? (b as number) - (a as number)
        : (a as number) - (b as number);
    }

    if (Test.isText(a) && Test.isText(b)) {
      return desc
        ? (b as string).localeCompare(a as string)
        : (a as string).localeCompare(b as string);
    }

    if (Test.isDate(a) && Test.isDate(b)) {
      return desc ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
    }

    if (Test.isArray(a) && Test.isArray(b)) {
      return desc ? b.length - a.length : a.length - b.length;
    }

    if (Test.isObject(a) && Test.isObject(b)) {
      return desc
        ? Object.keys(b).length - Object.keys(a).length
        : Object.keys(a).length - Object.keys(b).length;
    }

    return desc ? power(b) - power(a) : power(a) - power(b);
  }

  public isItem(item: any): Boolean {
    return (
      Test.isObject(item) &&
      Test.hasProps(item, ['key', 'value']) &&
      Test.hasLength(item, 2) &&
      (Test.isText(item.key) || Test.isUndefined(item.key))
    );
  }

  public log(...values: any): Stack<T> {
    if (Test.isNonEmptyArray(values)) console.log(...values);
    else console.log(this._items);
    return this;
  }

  public set(key: string, value: any): Stack<T> {
    if (!Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    const items = this.items();

    // update existing item
    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];

      if (Test.isText(item.key) && item.key === key) {
        item.value = value;
        this._items = items;
        return this;
      }
    }

    // push new item with new key
    this._items.push({ key, value });
    return this;
  }

  public setMany(items: KeyItems<T>): Stack<T> {
    if (!Test.isObject(items)) {
      throw new StackError('Invalid stack items provided');
    }

    for (const key in items) {
      this.set(key, items[key]);
    }

    return this;
  }

  public put(index: number, key: string | undefined, value: any): Stack<T> {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }

    if (!Test.isUndefined(key) && !Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    if (Test.isText(key) && this.hasKey(key)) {
      throw new StackError(`Key '${key}' already exists`);
    }

    this._items.splice(index, 0, { key, value });

    return this;
  }

  public putMany(
    index: number,
    items: IndexItems<T> | KeyItems<T> | Items<T>
  ): Stack<T> {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }

    if (Test.isArray(items)) {
      for (let $index = 0; $index < (items as IndexItems<T>).length; $index++) {
        const item = (items as Array<any>)[$index];

        if (this.isItem(item)) {
          this.put(index, item.key, item.value);
          continue;
        }

        this._items.splice(index, 0, { key: undefined, value: item });
      }
      return this;
    }

    if (Test.isObject(items)) {
      for (const key in items) {
        this.put(index, key, (items as KeyItems<T>)[key]);
      }

      return this;
    }

    throw new StackError('Invalid stack items provided');
  }

  public edit(index: number, value: any): Stack<T> {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }

    if (!this.hasIndex(index)) {
      throw new StackError('No item found at the given index');
    }

    this._items[index].value = value;

    return this;
  }

  public editKeys(
    editor: (key: string | undefined, value: T, index: number) => string
  ): Stack<T> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    const items = this.items();

    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];

      this._items[$index].key = editor(item.key, item.value, $index);
    }

    return this;
  }

  public editValues(
    editor: (key: string | undefined, value: T, index: number) => T
  ): Stack<T> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    const items = this.items();

    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];
      this._items[$index].value = editor(item.key, item.value, $index);
    }

    return this;
  }

  public each(
    editor: (key: string | undefined, value: T, index: number) => undefined
  ): Stack<T> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    const items = this.items();

    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];
      editor(item.key, item.value, $index);
    }

    return this;
  }

  public filter(
    editor: (key: string | undefined, value: T, index: number) => boolean
  ): Stack<T> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    const items: Array<Item<T>> = [];

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];

      if (editor(item.key, item.value, $index)) continue;

      items.push(item);
    }

    this._items = items;

    return this;
  }

  public group(
    editor: (key: string | undefined, value: T, index: number) => string
  ): Stack<Stack<T>> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    const items = this.items();
    const stack = new Stack<Stack<T>>();

    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];

      const groupName = editor(item.key, item.value, $index);

      if (!Test.isText(groupName)) {
        throw new StackError(`Group name must be a string`);
      }

      if (stack.hasKey(groupName)) {
        stack.get(groupName).put(Infinity, item.key, item.value);
        continue;
      }

      stack.set(groupName, new Stack().put(Infinity, item.key, item.value));
    }

    return stack;
  }

  public order(
    editor: (key: string, value: T) => any,
    desc: boolean = false
  ): Stack<T> {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    if (!Test.isBoolean(desc)) {
      throw new StackError(`The 'desc' option should be a boolean value`);
    }

    this._items.sort((a, b) =>
      this.compareFn(editor(a.key, a.value), editor(b.key, b.value), desc)
    );

    return this;
  }

  public orderKeys(desc: boolean = false): Stack<T> {
    if (!Test.isBoolean(desc)) {
      throw new StackError(`The 'desc' option should be a boolean value`);
    }

    this._items.sort((a, b) => {
      return this.compareFn(a.key, b.key, desc);
    });

    return this;
  }

  public orderValues(desc: boolean = false): Stack<T> {
    if (!Test.isBoolean(desc)) {
      throw new StackError(`The 'desc' option should be a boolean value`);
    }

    this._items.sort((a, b) => {
      return this.compareFn(a.value, b.value, desc);
    });

    return this;
  }

  public shuffle(): Stack<T> {
    const array = this.items();

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._items[i], this._items[j]] = [this._items[j], this._items[i]];
    }

    return this;
  }

  public reverse(): Stack<T> {
    this._items.reverse();
    return this;
  }

  public when(
    condition: (key: string | undefined, value: T, index: number) => boolean,
    action: (key: string | undefined, value: T, index: number) => void
  ): Stack<T> {
    if (!Test.isFunction(condition)) {
      throw new StackError(`The condition must be a function`);
    }

    if (!Test.isFunction(action)) {
      throw new StackError(`The action must be a function`);
    }

    const items = this.items();

    for (let $index = 0; $index < items.length; $index++) {
      const item = items[$index];

      if (!condition(item.key, item.value, $index)) continue;

      action(item.key, item.value, $index);
    }

    return this;
  }

  public union(...stacks: Array<Stack<T>>): Stack<T> {
    stacks.forEach((stack) => {
      if (!(stack instanceof Stack)) {
        throw new StackError('The stacks must be instances of Stack');
      }

      this._items = this._items.concat(stack.items());
    });

    return this;
  }

  public join(
    editor: (key: string | undefined, value: T, index: number) => T,
    sep: string = ','
  ): string {
    if (!Test.isFunction(editor)) {
      throw new StackError(`The editor must be a function`);
    }

    if (!Test.isText(sep)) {
      throw new StackError(`The separator must be a string`);
    }

    const values = [];

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      values.push(editor(item.key, item.value, $index));
    }

    return values.join(sep);
  }

  public chunk(size: number): Stack<Stack<T>> {
    if (!Test.isInteger(size)) {
      throw new StackError('Chunk size must be an integer greater than 0');
    }

    if (!Test.isGreaterThan(size, 0)) {
      throw new StackError('Chunk size must be an integer greater than 0');
    }

    const stack: Stack<Stack<T>> = new Stack();

    for (let $index = 0; $index < this._items.length; $index += size) {
      stack.put(
        Infinity,
        undefined,
        new Stack(this._items.slice($index, $index + size))
      );
    }

    return stack;
  }

  public has(
    check: (key: string | undefined, value: T, index: number) => boolean
  ): boolean {
    if (!Test.isFunction(check)) {
      throw new StackError(`The check must be a function`);
    }

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];

      if (check(item.key, item.value, $index)) return true;
    }

    return false;
  }

  public hasKey(key: string): boolean {
    if (!Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    return this._items.find((item) => item.key === key) ? true : false;
  }

  public hasKeyAt(index: number): boolean {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }

    return this._items[index] !== undefined
      ? this._items[index].key !== undefined
        ? true
        : false
      : false;
  }

  public hasValue(value: any): boolean {
    return this._items.find((item) => item.value === value) ? true : false;
  }

  public hasIndex(index: number): boolean {
    if (!Test.isInteger(index)) {
      throw new StackError(`Item index must be an integer`);
    }

    return Test.hasIndex(this._items, index);
  }

  public someHas(
    check: (key: string | undefined, value: T, index: number) => boolean,
    count: number = 1
  ): boolean {
    if (!Test.isFunction(check)) {
      throw new StackError(`The check must be a function`);
    }

    if (!Test.isInteger(count)) {
      throw new StackError(`The count must be an integer`);
    }

    let $count = 0;

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      if (check(item.key, item.value, $index)) {
        $count++;

        if (count === $count) return true;
      }
    }

    return false;
  }

  public allHas(
    check: (key: string | undefined, value: T, index: number) => boolean
  ): boolean {
    if (!Test.isFunction(check)) {
      throw new StackError(`The check must be a function`);
    }

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      if (!check(item.key, item.value, $index)) return false;
    }

    return true;
  }

  public values(): Array<T> {
    const values: T[] = [];

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      values.push(item.value);
    }

    return values;
  }

  public keys(): Array<string> {
    const keys: string[] = [];

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];

      if (!Test.isUndefined(item.key)) keys.push(item.key);
    }
    return keys;
  }

  public items<R>(): Items<T & R> {
    const items: Array<Item<T & R>> = [];

    this._items.forEach((item) => {
      items.push({ key: item.key, value: item.value as T & R });
    });

    return items;
  }

  public size(): number {
    return this._items.length;
  }

  public get(key: string): T | undefined {
    if (!Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    for (let index = 0; index < this._items.length; index++) {
      const item = this._items[index];
      if (!Test.isUndefined(item.key) && item.key === key)
        return item.value as T;
    }

    return undefined;
  }

  public getAt(index: number): T | undefined {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }
    return this._items[index] ? this._items[index].value : undefined;
  }

  public getKeyAt(index: number): string | undefined {
    if (!Test.isInteger(index)) {
      throw new StackError(`Item index must be an integer`);
    }
    return this._items[index] ? this._items[index].key : undefined;
  }

  public getIndex(key: string): number | undefined {
    if (!Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];

      if (!Test.isUndefined(item) && item.key === key) return $index;
    }
  }

  public getWhen(
    condition: (key: string | undefined, value: T, index: number) => boolean
  ): T | undefined {
    if (!Test.isFunction(condition)) {
      throw new StackError(`The condition must be a function`);
    }

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      if (!condition(item.key, item.value, $index)) continue;
      return item.value;
    }
  }

  public getMany<R>(
    getter: (key: string | undefined, value: T, index: number) => R | undefined
  ): Array<R> {
    if (!Test.isFunction(getter)) {
      throw new StackError(`The getter must be a function`);
    }

    const result: Array<R> = [];

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      const value = getter(item.key, item.value, $index);

      if (Test.isUndefined(value)) continue;

      result.push(value);
    }

    return result;
  }

  public getOne<R>(
    getter: (key: string | undefined, value: T, index: number) => R | undefined
  ): R {
    if (!Test.isFunction(getter)) {
      throw new StackError(`The getter must be a function`);
    }

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      const value = getter(item.key, item.value, $index);
      if (!Test.isUndefined(value)) return value;
    }
  }

  public toObject(_anonymous: boolean = true): ObjectShape<T> {
    if (!Test.isBoolean(_anonymous)) {
      throw new StackError(`The '_anonymous' options must be boolean`);
    }

    const items: ObjectShape<T> = {};

    for (let $index = 0; $index < this._items.length; $index++) {
      const item = this._items[$index];
      if (Test.isText(item.key)) {
        items[item.key] = item.value;
        continue;
      }

      if (!_anonymous) continue;

      if (Test.isUndefined(items._anonymous)) {
        items._anonymous = new Array();
      }

      items._anonymous.push(item.value);
    }

    return items;
  }

  public toArray(): ArrayShape<T> {
    const items: ArrayShape<T> = [];

    this._items.forEach((item) => {
      items.push([item.key, item.value]);
    });

    return items;
  }

  public delete(key: string): Stack<T> {
    if (!Test.isText(key)) {
      throw new StackError(`Item key must be a string`);
    }

    const index = this.getIndex(key);
    if (Test.isNumber(index)) this.deleteAt(index);
    return this;
  }

  public deleteAt(index: number): Stack<T> {
    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }

    this._items.splice(index, 1);

    return this;
  }

  public deleteFrom(index: number, count: number): Stack<T> {
    if (!Test.isInteger(count)) {
      throw new StackError('Item delete count must be an integer');
    }

    if (!Test.isInteger(index) && !(index === Infinity)) {
      throw new StackError(`Item index must be an integer`);
    }
    this._items.splice(index, count);
    return this;
  }

  public deleteFromTo(start: number, end: number): Stack<T> {
    if (!Test.isInteger(end) && end !== Infinity) {
      throw new StackError(`The delete 'end' option must be an integer`);
    }

    if (!Test.isInteger(start)) {
      throw new StackError(`Item start must be an integer`);
    }

    this.filter((key, value, index) => index >= start && index < end);

    return this;
  }
}
