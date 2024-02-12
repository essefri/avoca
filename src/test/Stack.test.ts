import { Stack } from '../../modules/Stack';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Stack.constructor', () => {
  it('should create an empty stack', () => {
    const stack = new Stack();
    expect(stack).toBeInstanceOf(Stack);
    expect(stack.values()).toEqual([]);
  });

  it('should create a stack with initial values', () => {
    const stack1 = new Stack([1, 2, 3]);
    const stack2 = new Stack({ name: 'John', age: 30 });

    expect(stack1.values()).toEqual([1, 2, 3]);
    expect(stack2.values()).toEqual(['John', 30]);
  });

  it('should throw an error for invalid initial values', () => {
    expect(() => new Stack('hello world' as any)).toThrow(
      'Stack items must be an Array or Object'
    );
  });
});

describe('Log', () => {
  it('should log the stack', () => {
    const logSpy = jest.spyOn(console, 'log');
    const stack = new Stack([1, 2, 3]);

    stack.log();

    expect(logSpy).toHaveBeenCalledWith([
      { key: undefined, value: 1 },
      { key: undefined, value: 2 },
      { key: undefined, value: 3 },
    ]);

    stack.log('Hello, Stack!');
    expect(logSpy).toHaveBeenCalledWith('Hello, Stack!');
  });
});

describe('Set', () => {
  it('should add and update key-value pairs', () => {
    const stack = new Stack();

    expect(stack.set('age', 44).toObject()).toEqual({ age: 44 });
    expect(stack.set('age', 66).toObject()).toEqual({ age: 66 });
  });

  it('should throw an error for invalid key type', () => {
    const stack = new Stack();
    expect(() => stack.set(77 as any, 55)).toThrow('Item key must be a string');
  });
});

describe('SetMany', () => {
  it('should add and update multiple key-value pairs', () => {
    const stack = new Stack();

    expect(
      stack.setMany({ name: 'Simon', age: 44, gender: 'male' }).toObject()
    ).toEqual({ name: 'Simon', age: 44, gender: 'male' });

    expect(stack.setMany({ name: 'James', age: 33 }).toObject()).toEqual({
      name: 'James',
      age: 33,
      gender: 'male',
    });
  });

  it('should throw an error for invalid items type', () => {
    const stack = new Stack();
    expect(() => stack.setMany('hello world' as any)).toThrow(
      'Invalid stack items provided'
    );
  });
});

describe('Stack.put', () => {
  it('should unshift an item at the beginning', () => {
    let stack = new Stack([1, 2]);

    stack.put(0, 'name', 'simon');
    expect(stack.getIndex('name')).toBe(0);
  });

  it('should push an item at the end', () => {
    let stack = new Stack([1, 2]);

    stack.put(Infinity, 'age', 44);
    expect(stack.getIndex('age')).toBe(2);
  });

  it('should allow items without keys', () => {
    let stack = new Stack([1, 2]);

    expect(() => stack.put(0, undefined, 66)).not.toThrow();
  });

  it('should throw an error if key is not a string', () => {
    let stack = new Stack([1, 2]);

    expect(() => stack.put(0, 88 as any, 'hello world')).toThrow(
      `Item key must be a string`
    );
  });

  it('should throw an error if key is not unique', () => {
    let stack = new Stack([1, 2]);

    stack.put(0, 'name', 'simon');
    expect(() => stack.put(0, 'name', 'james')).toThrow(
      `Key 'name' already exists`
    );
  });

  it('should throw an error if index is not an integer', () => {
    let stack = new Stack([1, 2]);

    expect(() => stack.put('index' as any, undefined, 77)).toThrow(
      `Item index must be an integer`
    );
  });
});

describe('Stack.putMany', () => {
  it('should unshift many key-value pairs', () => {
    let stack = new Stack<string | number>([1, 2]);

    stack.putMany(0, { name: 'simon', age: 44 });
    expect(stack.getAt(0)).toBe(44);
    expect(stack.getAt(1)).toBe('simon');
  });

  it('should push many values', () => {
    let stack = new Stack<string | number>([1, 2]);

    stack.putMany(Infinity, [3, 4]);
    expect(stack.getAt(2)).toBe(3);
    expect(stack.getAt(3)).toBe(4);
  });

  it('should throw an error if index is not an integer', () => {
    let stack = new Stack<string | number>([1, 2]);

    expect(() => stack.putMany(8.5, [1, 2])).toThrow(
      `Item index must be an integer`
    );
  });

  it('should throw an error if items are not an object or an array', () => {
    let stack = new Stack<string | number>([1, 2]);

    expect(() => stack.putMany(8, 'hello' as any)).toThrow(
      'Invalid stack items provided'
    );
  });

  it('should throw an error if keys are not unique', () => {
    let stack = new Stack<string | number>([1, 2]);

    stack.putMany(0, { name: 'simon', age: 44 });

    expect(() => stack.putMany(0, { age: 66 })).toThrow(
      `Key 'age' already exists`
    );
  });

  it('should handle an empty array and object safely', () => {
    let stack = new Stack<string | number>([1, 2]);

    expect(() => stack.putMany(0, [])).not.toThrow();
    expect(() => stack.putMany(0, {})).not.toThrow();
  });
});

describe('Stack.edit', () => {
  let stack = new Stack([1, 2]);

  it('should edit value at the specified index', () => {
    expect(stack.edit(0, 22).toObject()).toEqual({ _anonymous: [22, 2] });

    expect(stack.edit(1, 44).toObject()).toEqual({ _anonymous: [22, 44] });
  });

  it('should throw an error if index is not an integer', () => {
    expect(() => stack.edit('index' as any, 'value')).toThrow(
      `Item index must be an integer`
    );
  });

  it('should throw an error if index does not exist', () => {
    expect(() => stack.edit(7777, 'value')).toThrow(
      'No item found at the given index'
    );
  });
});

describe('Stack.editKeys', () => {
  let stack = new Stack({ name: 'simon', age: 44 });

  it('should edit keys using the provided editor function', () => {
    expect(stack.editKeys((key) => 'my'.concat(' ', key)).keys()).toEqual([
      'my name',
      'my age',
    ]);
  });

  it('should throw an error if the editor is not a function', () => {
    expect(() => stack.editKeys('hello' as any)).toThrow(
      `The editor must be a function`
    );
  });
});

describe('Stack.editValues', () => {
  let stack = new Stack({ name: 'simon', age: 44 });

  it('should edit values using the provided editor function', () => {
    stack.editValues((key, value) => 'im'.concat(' ', value.toString()));

    expect(stack.values()).toEqual(['im simon', 'im 44']);
  });

  it('should throw an error if the editor is not a function', () => {
    expect(() => stack.editValues('hello' as any)).toThrow(
      `The editor must be a function`
    );
  });
});

describe('Stack.each', () => {
  it('should iterate and modify items using the provided editor function', () => {
    const stack = new Stack<number | string>({ name: 'Simon', age: 22 });

    stack.each((key, value, index) => {
      if (key === 'name') {
        stack.set('name', `My name is ${value}`);
      } else {
        stack.set('age', `My age is ${value}`);
      }
    });

    expect(stack.toObject()).toEqual({
      name: 'My name is Simon',
      age: 'My age is 22',
    });
  });

  it('should throw an error if the editor is not a function', () => {
    const stack = new Stack<number | string>({ name: 'Simon', age: 22 });

    expect(() => stack.each('invalid' as any)).toThrow(
      `The editor must be a function`
    );
  });
});

describe('Stack.filter', () => {
  it('should filter items based on the provided editor function', () => {
    const stack = new Stack<number | string>({ name: 'Simon', age: 22 });

    // Ensure an error is thrown if the editor is not a function
    expect(() => stack.filter('invalid' as any)).toThrow(
      `The editor must be a function`
    );

    // Add some additional items to the stack
    stack.putMany(Infinity, [1, 2, 4]);

    // Filter items where the key is undefined
    stack.filter((key) => key === undefined);

    // Expect that only the original items are retained, and the filtered items are removed
    expect(stack.toObject()).toEqual({ name: 'Simon', age: 22 });
  });

  it('should filter items based on a custom condition', () => {
    const stack = new Stack<number>({ one: 1, two: 2, three: 3, four: 4 });

    // Filter items to keep only those with values greater than 2
    stack.filter((key, value) => value <= 2);

    // Expect that items with values less than or equal to 2 are removed
    expect(stack.toObject()).toEqual({ three: 3, four: 4 });
  });

  it('should handle an empty stack when using filter', () => {
    const emptyStack = new Stack<number>();

    // Filter on an empty stack
    emptyStack.filter((key, value) => value > 0);

    // Expect that the empty stack remains unchanged
    expect(emptyStack.toObject()).toEqual({});
  });
});

describe('stack.group', () => {
  it('should group items based on the provided editor function', () => {
    const stack = new Stack([
      { gender: 'male' },
      { gender: 'male' },
      { gender: 'female' },
    ]).group((key, value) => value.gender);

    expect(stack.keys()).toEqual(['male', 'female']);
    expect(stack.get('male').values()).toEqual([
      { gender: 'male' },
      { gender: 'male' },
    ]);
    expect(stack.get('female').values()).toEqual([{ gender: 'female' }]);
  });

  it('should throw an error if the editor is not a function', () => {
    const stack = new Stack([{ gender: 'male' }, { gender: 'female' }]);
    expect(() => stack.group('invalid' as any)).toThrow(
      `The editor must be a function`
    );
  });

  it('should throw an error if the group name is not a string', () => {
    const stack = new Stack([{ gender: 'male' }, { gender: 'female' }]);
    expect(() => stack.group(() => 666 as any)).toThrow(
      `Group name must be a string`
    );
  });
});

describe('Stack.order', () => {
  describe('numbers', () => {
    it('should order in ascending order', () => {
      const stack = new Stack([1, 5, 3, 4, 2]);

      expect(stack.order((key, value) => value).values()).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it('should order in descending order', () => {
      const stack = new Stack([1, 5, 3, 4, 2]);

      expect(stack.order((key, value) => value, true).values()).toEqual([
        5, 4, 3, 2, 1,
      ]);
    });

    it('should throw an error if the editor is not a function', () => {
      const stack = new Stack([1, 5, 3, 4, 2]);

      expect(() => stack.order('hello' as any)).toThrow(
        `The editor must be a function`
      );
    });

    it('should throw an error if the desc option is not a boolean value', () => {
      const stack = new Stack([1, 5, 3, 4, 2]);

      expect(() => stack.order(() => {}, 'hello' as any)).toThrow(
        `The 'desc' option should be a boolean value`
      );
    });
  });

  describe('strings', () => {
    it('should order in ascending order', () => {
      const stack = new Stack(['a', 'c', 'd', 'e', 'b']);

      expect(stack.order((key, value) => value).values()).toEqual([
        'a',
        'b',
        'c',
        'd',
        'e',
      ]);
    });

    it('should order in descending order', () => {
      const stack = new Stack(['a', 'c', 'd', 'e', 'b']);

      expect(stack.order((key, value) => value, true).values()).toEqual([
        'e',
        'd',
        'c',
        'b',
        'a',
      ]);
    });
  });

  describe('dates', () => {
    it('should order in ascending order', () => {
      const stack = new Stack([
        new Date('2023-10-24'),
        new Date('2023-10-27'),
        new Date('2023-10-25'),
        new Date('2023-10-26'),
      ]);

      expect(stack.order((key, value) => value).values()).toEqual([
        new Date('2023-10-24'),
        new Date('2023-10-25'),
        new Date('2023-10-26'),
        new Date('2023-10-27'),
      ]);
    });

    it('should order in descending order', () => {
      const stack = new Stack([
        new Date('2023-10-24'),
        new Date('2023-10-27'),
        new Date('2023-10-25'),
        new Date('2023-10-26'),
      ]);

      expect(stack.order((key, value) => value, true).values()).toEqual([
        new Date('2023-10-27'),
        new Date('2023-10-26'),
        new Date('2023-10-25'),
        new Date('2023-10-24'),
      ]);
    });
  });

  describe('arrays', () => {
    it('should order in ascending order', () => {
      const stack = new Stack([[1, 2, 3], [1, 2], [1, 2, 3, 4], [1]]);

      expect(stack.order((key, value) => value).values()).toEqual([
        [1],
        [1, 2],
        [1, 2, 3],
        [1, 2, 3, 4],
      ]);
    });

    it('should order in descending order', () => {
      const stack = new Stack([[1, 2, 3], [1, 2], [1, 2, 3, 4], [1]]);

      expect(stack.order((key, value) => value, true).values()).toEqual([
        [1, 2, 3, 4],
        [1, 2, 3],
        [1, 2],
        [1],
      ]);
    });
  });

  describe('objects', () => {
    it('should order in ascending order', () => {
      const stack = new Stack([
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2 },
        { a: 1, b: 2, c: 3, e: 4 },
        { a: 1 },
      ]);

      expect(stack.order((key, value) => value).values()).toEqual([
        { a: 1 },
        { a: 1, b: 2 },
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2, c: 3, e: 4 },
      ]);
    });

    it('should order in descending order', () => {
      const stack = new Stack([
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2 },
        { a: 1, b: 2, c: 3, e: 4 },
        { a: 1 },
      ]);

      expect(stack.order((key, value) => value, true).values()).toEqual([
        { a: 1, b: 2, c: 3, e: 4 },
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 2 },
        { a: 1 },
      ]);
    });
  });

  describe('mixed types', () => {
    it('should order in ascending order', () => {
      const stack = new Stack([
        {},
        'hello',
        false,
        55,
        null,
        () => {},
        undefined,
      ]);

      expect(
        stack
          .order((key, value) => value)
          .values()
          .map((value) => (typeof value === 'function' ? 'function' : value))
      ).toEqual([{}, 'function', 'hello', 55, false, null, undefined]);
    });

    it('should order in descending order', () => {
      const stack = new Stack([
        {},
        'hello',
        false,
        55,
        null,
        () => {},
        undefined,
      ]);

      expect(
        stack
          .order((key, value) => value, true)
          .values()
          .map((value) => (typeof value === 'function' ? 'function' : value))
      ).toEqual([undefined, null, false, 55, 'hello', 'function', {}]);
    });
  });
});

describe('Stack.orderKeys', () => {
  it('should order keys in ascending order', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(stack.orderKeys().keys()).toEqual(['age', 'gender', 'name']);
  });

  it('should order keys in descending order', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(stack.orderKeys(true).keys()).toEqual(['name', 'gender', 'age']);
  });

  it('should throw an error if the desc option is not a boolean value', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(() => stack.orderKeys('hello' as any)).toThrow(
      `The 'desc' option should be a boolean value`
    );
  });
});

describe('Stack.orderValues', () => {
  it('should order values in ascending order', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(stack.orderValues().values()).toEqual(['male', 'simon', 44]);
  });

  it('should order values in descending order', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(stack.orderValues(true).values()).toEqual([44, 'simon', 'male']);
  });

  it('should throw an error if the desc option is not a boolean value', () => {
    const stack = new Stack({
      name: 'simon',
      age: 44,
      gender: 'male',
    });

    expect(() => stack.orderValues('hello' as any)).toThrow(
      `The 'desc' option should be a boolean value`
    );
  });
});

describe('Stack.shuffle', () => {
  it('should shuffle the stack', () => {
    const stack = new Stack([1, 2, 3, 4, 5]);

    expect(stack.shuffle().values()).not.toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Stack.reverse', () => {
  it('should reverse the stack', () => {
    const stack = new Stack([1, 2, 3, 4, 5]);

    expect(stack.reverse().values()).toEqual([5, 4, 3, 2, 1]);
  });
});

describe('Stack.when', () => {
  it('should execute action when condition is met', () => {
    const stack = new Stack([1, 2, 3, '4', '5']);

    expect(
      stack
        .when(
          (key, value) => typeof value === 'string',
          (key, value, index) =>
            stack.edit(index, parseInt(value as string, 10))
        )
        .values()
    ).toEqual([1, 2, 3, 4, 5]);

    expect(() => stack.when('hello' as any, 'hello' as any)).toThrow(
      `The condition must be a function`
    );

    expect(() => stack.when((() => {}) as any, 'hello' as any)).toThrow(
      `The action must be a function`
    );
  });
});

describe('Stack.union', () => {
  it('should combine two stacks', () => {
    const stack1 = new Stack<string | number>([1, 2, 3]);
    const stack2 = new Stack({ name: 'simon', age: 22 });

    expect(stack1.union(stack2).toObject()).toEqual({
      name: 'simon',
      age: 22,
      _anonymous: [1, 2, 3],
    });

    expect(() => new Stack().union({} as any)).toThrow(
      'The stacks must be instances of Stack'
    );
  });
});

describe('Stack.join', () => {
  it('should concatenate values with a separator', () => {
    const stack = new Stack([1, 2, 3]);

    expect(stack.join((key, value) => value, ' ')).toEqual('1 2 3');

    expect(() => stack.join('hello' as any)).toThrow(
      `The editor must be a function`
    );

    expect(() => stack.join(() => 77, 77 as any)).toThrow(
      `The separator must be a string`
    );
  });
});

describe('Stack.chunk', () => {
  it('should split the stack into chunks of a given size', () => {
    const stack = new Stack([1, 2, 3, 4, 5]).chunk(2);

    expect(stack.values()).toHaveLength(3);
    expect(stack.values()[0].values()).toEqual([1, 2]);
    expect(stack.values()[1].values()).toEqual([3, 4]);
    expect(stack.values()[2].values()).toEqual([5]);

    expect(() => stack.chunk(0)).toThrow(
      'Chunk size must be an integer greater than 0'
    );

    expect(() => stack.chunk('hello' as any)).toThrow(
      'Chunk size must be an integer greater than 0'
    );
  });
});

describe('Stack.isItem', () => {
  it('should check if an item matches a pattern', () => {
    expect(new Stack().isItem({ key: undefined, value: 1 })).toBeTruthy();
  });
});

describe('Stack.has', () => {
  it('should check if any item satisfies a condition', () => {
    const stack = new Stack<number | string>({ name: 'simon', age: 22 });

    expect(() => stack.has('hello' as any)).toThrow(
      `The check must be a function`
    );

    expect(stack.has((key, value, index) => value === 'simon')).toBeTruthy();
    expect(stack.has(() => false)).toBeFalsy;
  });
});

describe('Stack.hasKey', () => {
  it('should check if a key exists in the stack', () => {
    const stack = new Stack({ name: 'simon', age: 22 });

    expect(() => stack.hasKey(66 as any)).toThrow(`Item key must be a string`);

    expect(stack.hasKey('name')).toBeTruthy();
    expect(stack.hasKey('age')).toBeTruthy();
    expect(stack.hasKey('test')).toBeFalsy();
  });
});

describe('Stack.hasKeyAt', () => {
  it('should check if a key exists at a specific index', () => {
    const stack = new Stack({ name: 'simon', age: 22 });

    expect(() => stack.hasKeyAt('hello' as any)).toThrow(
      `Item index must be an integer`
    );

    expect(stack.hasKeyAt(0)).toBeTruthy();

    expect(
      stack
        .put(Infinity, undefined, 'hello')
        .hasKeyAt(
          stack.getOne((key, value, index) =>
            value === 'hello' ? index : undefined
          )
        )
    ).toBeFalsy();
  });
});

describe('Stack.hasValue', () => {
  it('should check if a value exists in the stack', () => {
    const stack = new Stack([1, 2, 3]);

    expect(stack.hasValue(2)).toBeTruthy();
    expect(stack.hasValue('66')).toBeFalsy();
  });
});

describe('Stack.hasIndex', () => {
  it('should check if an index exists in the stack', () => {
    const stack = new Stack([1, 2, 3]);

    expect(stack.hasIndex(2)).toBeTruthy();
    expect(stack.hasIndex(4)).toBeFalsy();
    expect(() => stack.hasIndex('66' as any)).toThrow(
      `Item index must be an integer`
    );
  });
});

describe('Stack.someHas', () => {
  it('should check if some items satisfy a condition', () => {
    const stack = new Stack([
      { name: 'simon', age: 13 },
      { name: 'james', age: 16 },
      { name: 'mike', age: 22 },
    ]);

    expect(() => stack.someHas('hello' as any)).toThrow(
      `The check must be a function`
    );

    expect(() => stack.someHas(() => true, 'hello' as any)).toThrow(
      `The count must be an integer`
    );

    expect(stack.someHas((key, value) => value.age <= 18, 1)).toBeTruthy();
    expect(stack.someHas((key, value) => value.age <= 18, 2)).toBeTruthy();
    expect(stack.someHas((key, value) => value.age <= 18, 3)).toBeFalsy();
    expect(stack.someHas((key, value) => value.age <= 18, 0)).toBeFalsy();
  });
});

describe('Stack.allHas', () => {
  it('should check if all items satisfy a condition', () => {
    const stack = new Stack([
      { name: 'simon', gender: 'male' },
      { name: 'james', gender: 'male' },
      { name: 'mike', gender: 'male' },
    ]);

    expect(() => stack.allHas('hello' as any)).toThrow(
      `The check must be a function`
    );

    expect(stack.allHas((key, value) => value.gender === 'male')).toBeTruthy();
    expect(
      stack
        .edit(0, { name: 'ely', gender: 'female' })
        .allHas((key, value) => value.gender === 'male')
    ).toBeFalsy();
  });
});

describe('Stack.values', () => {
  it('should return all values in the stack', () => {
    const stack = new Stack({ name: 'simon', age: 44 });

    expect(stack.values()).toEqual(['simon', 44]);

    expect(new Stack().values()).toEqual([]);
  });
});

describe('Stack.keys method', () => {
  it('should return all keys', () => {
    const stack = new Stack({ name: 'simon', age: 44 });

    expect(stack.keys()).toEqual(['name', 'age']);

    stack.put(0, undefined, 'hello');
    expect(stack.keys()).toEqual(['name', 'age']);

    expect(new Stack().keys()).toEqual([]);
  });
});

describe('Stack.items method', () => {
  it('should return all items', () => {
    const stack = new Stack<string | number>({
      age: 22,
      name: 'simon',
      gender: 'male',
    });

    const items = stack.items();

    expect(items).toEqual([
      { key: 'age', value: 22 },
      { key: 'name', value: 'simon' },
      { key: 'gender', value: 'male' },
    ]);

    items[0].key = 'newKey';
    items[0].value = 'new value';
    items[1] = null;
    items[2] = null;

    expect(items).toEqual([{ key: 'newKey', value: 'new value' }, null, null]);

    // updating the items returned does not affect the stack items
    expect(stack.items()).toEqual([
      { key: 'age', value: 22 },
      { key: 'name', value: 'simon' },
      { key: 'gender', value: 'male' },
    ]);

    // unless in the case of object values

    stack.filter(() => true).set('user', { name: 'simon' });
    stack.items<{ name: string }>()[0].value.name = 'updated';
    expect(stack.items()).toEqual([
      { key: 'user', value: { name: 'updated' } },
    ]);
  });
});

describe('Stack.size method', () => {
  it('should tell the size', () => {
    expect(new Stack([1, 2, 3, 4]).size()).toBe(4);
  });
});

describe('Stack.get method', () => {
  it('should return a value using a key', () => {
    const stack = new Stack({ name: 'simon', age: 9999 });

    expect(stack.get('name')).toBe('simon');
    expect(stack.get('age')).toBe(9999);
    expect(stack.get('gender')).toBeUndefined();

    expect(() => stack.get(55 as any)).toThrow(`Item key must be a string`);
  });
});
describe('Stack.getAt method', () => {
  it('should return a value at the specified index', () => {
    const stack = new Stack([1, 2, 3, 4]);

    expect(stack.getAt(0)).toBe(1);
    expect(stack.getAt(1)).toBe(2);
    expect(stack.getAt(2)).toBe(3);
    expect(stack.getAt(3)).toBe(4);
    expect(stack.getAt(4)).toBe(undefined);
    expect(() => stack.getAt('index' as any)).toThrow(
      `Item index must be an integer`
    );
  });
});

describe('Stack.getKeyAt method', () => {
  it('should return a key using an index', () => {
    const stack = new Stack({ name: 'simon', age: 22 });

    expect(stack.getKeyAt(0)).toBe('name');
    expect(stack.getKeyAt(666)).toBe(undefined);

    expect(() => stack.getKeyAt('index' as any)).toThrow(
      `Item index must be an integer`
    );
  });
});

describe('Stack.getIndex method', () => {
  it('should return the index of an item using the key', () => {
    const stack = new Stack({ name: 'simon', age: 22 });

    expect(stack.getIndex('name')).toBe(0);
    expect(stack.getIndex('age')).toBe(1);
    expect(stack.getIndex('hello world')).toBe(undefined);
    expect(() => stack.getIndex(55 as any)).toThrow(
      `Item key must be a string`
    );
  });
});

describe('Stack.getWhen method', () => {
  it('should return a value when a condition is met', () => {
    const stack = new Stack([1, 2, 3, 4, 5, 7, 8888]);

    expect(stack.getWhen((key, value, index) => value > 1000)).toBe(8888);

    expect(
      stack
        .filter((key, value) => value > 1000)
        .getWhen((key, value) => value > 1000)
    ).toBeUndefined();

    expect(() => stack.getWhen('hello' as any)).toThrow(
      `The condition must be a function`
    );
  });
});

describe('Stack.getMany method', () => {
  it('should return many values', () => {
    const stack = new Stack<string | number>([1, 2, 3]);
    stack.setMany({ name: 'simon', age: 55 });

    expect(
      stack.getMany((key, value, index) =>
        key === undefined ? value : undefined
      )
    ).toEqual([1, 2, 3]);

    expect(
      stack.getMany((key, value, index) =>
        key !== undefined ? value : undefined
      )
    ).toEqual(['simon', 55]);

    expect(
      stack.getMany((key, value, index) =>
        key === undefined ? index : undefined
      )
    ).toEqual([0, 1, 2]);

    expect(() => stack.getMany('any' as any)).toThrow(
      `The getter must be a function`
    );
  });
});

describe('Stack.getOne method', () => {
  it('should return one value of your choice', () => {
    const stack = new Stack<string | number>([
      1,
      2,
      { key: 'name', value: 44 } as any,
    ]);

    expect(
      stack.getOne((key, value, index) => (key === 'name' ? index : undefined))
    ).toBe(2);

    expect(() => stack.getOne('any' as any)).toThrow(
      `The getter must be a function`
    );
  });
});

describe('Stack.toObject method', () => {
  it('should represent the stack as an object', () => {
    const stack = new Stack([1, 2, 3, 4, { key: 'name', value: 'simon' }]);

    expect(stack.toObject()).toEqual({
      name: 'simon',
      _anonymous: [1, 2, 3, 4],
    });
    expect(stack.toObject(false)).toEqual({ name: 'simon' });
    expect(() => stack.toObject('any' as any)).toThrow(
      `The '_anonymous' options must be boolean`
    );
  });
});

describe('Stack.toArray method', () => {
  it('should represent the stack as an array', () => {
    const stack = new Stack([1, 2, 3, 4, { key: 'name', value: 'simon' }]);

    expect(stack.toArray()).toEqual([
      [undefined, 1],
      [undefined, 2],
      [undefined, 3],
      [undefined, 4],
      ['name', 'simon'],
    ]);
  });
});

describe('Stack.delete method', () => {
  it('should delete an item using the key', () => {
    const stack = new Stack([1, 2, 3, 4, { key: 'name', value: 'simon' }]);

    expect(stack.delete('name').values()).toEqual([1, 2, 3, 4]);
    expect(() => stack.delete(66 as any)).toThrow(`Item key must be a string`);
  });
});

describe('Stack.deleteAt method', () => {
  it('should delete an item using the index', () => {
    const stack = new Stack([1, 2, 3, { key: 'name', value: 'simon' }]);

    expect(stack.deleteAt(3).values()).toEqual([1, 2, 3]);

    expect(() => stack.deleteAt('index' as any)).toThrow(
      `Item index must be an integer`
    );
  });
});

describe('Stack.deleteFrom method', () => {
  it('should delete from an index', () => {
    const stack = new Stack([1, 2, 3, { key: 'name', value: 'simon' }]);

    expect(stack.deleteFrom(0, 3).values()).toEqual(['simon']);

    expect(() => stack.deleteFrom('index' as any, 7)).toThrow(
      `Item index must be an integer`
    );

    expect(() => stack.deleteFrom(77, 'count' as any)).toThrow(
      'Item delete count must be an integer'
    );
  });
});

describe('Stack.deleteFromTo method', () => {
  it('should delete from to', () => {
    const stack = new Stack([1, 2, 3]);

    expect(stack.deleteFromTo(1, Infinity).values()).toEqual([1]);

    expect(() => stack.deleteFromTo('start' as any, 7)).toThrow(
      `Item start must be an integer`
    );

    expect(() => stack.deleteFromTo(77, 'end' as any)).toThrow(
      `The delete 'end' option must be an integer`
    );
  });
});
