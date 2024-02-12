import { Config } from '../../modules/Config';

describe('Config.mix', () => {
  it('throws an error for undefined source', () => {
    expect(() => Config.mix(undefined)).toThrowError(
      "The 'source' argument must be an object"
    );
  });

  it('merges two objects', () => {
    expect(Config.mix({ a: 1, b: 2 }, { c: 3, e: 4 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
      e: 4,
    });
  });

  it('merges objects deeply', () => {
    expect(Config.mix({ a: { a: 1, b: 2 }, b: 2 }, { b: 3, c: 4 })).toEqual({
      a: { a: 1, b: 2 },
      b: 3,
      c: 4,
    });
  });
});

describe('Config.extract', () => {
  test('extracts specified keys from the source object', () => {
    const source = { name: 'John', age: 30, city: 'New York' };
    const keysToExtract = ['name', 'age'];

    const result = Config.extract(source, keysToExtract);

    expect(result).toEqual({ name: 'John', age: 30 });
    expect(source).toEqual({ name: 'John', age: 30, city: 'New York' }); // haven't modified
  });

  test('extracts specified keys from the source object with default values', () => {
    const source = { name: 'John', age: 30, city: 'New York' };
    const keysToExtract = ['name', 'age', 'country'];
    const defaultValue = { country: 'USA' };

    const result = Config.extract(source, keysToExtract, defaultValue);

    expect(result).toEqual({ name: 'John', age: 30, country: 'USA' });
    expect(source).toEqual({ name: 'John', age: 30, city: 'New York' }); // haven't modified
  });

  test('throws ConfigError if keys argument is not an array', () => {
    const source = { name: 'John', age: 30 };
    const keysToExtract = 'name' as any;

    expect(() => Config.extract(source, keysToExtract)).toThrowError(
      "The 'keys' argument must be an array of strings"
    );
  });

  test('throws ConfigError if source argument is not an object', () => {
    const source = null as any;
    const keysToExtract = ['name', 'age'];

    expect(() => Config.extract(source, keysToExtract)).toThrowError(
      "The 'source' argument must be an object"
    );
  });

  test('throws ConfigError if def argument is provided and is not an object', () => {
    const source = { name: 'John', age: 30 };
    const keysToExtract = ['name', 'age'];
    const defaultValue = 'default' as any;

    expect(() =>
      Config.extract(source, keysToExtract, defaultValue)
    ).toThrowError("The 'def' argument must be an object");
  });

  test('throws ConfigError if a key in keys array is not a string', () => {
    const source = { name: 'John', age: 30 };
    const keysToExtract = ['name', 123];

    expect(() => Config.extract(source, keysToExtract as any)).toThrowError(
      "The 'keys' argument must be an array of strings"
    );
  });

  test('throws ConfigError if a specified key is missing in the source object and no default value is provided', () => {
    const source = { name: 'John', age: 30 };
    const keysToExtract = ['name', 'city'];

    expect(() => Config.extract(source, keysToExtract)).toThrowError(
      "Missing property 'city'"
    );
  });

  test('uses default value for missing keys in the source object', () => {
    const source = { name: 'John', age: 30 };
    const keysToExtract = ['name', 'city'];
    const defaultValue = { city: 'Unknown' };

    const result = Config.extract(source, keysToExtract, defaultValue);

    expect(result).toEqual({ name: 'John', city: 'Unknown' });
    expect(source).toEqual({ name: 'John', age: 30 }); // haven't modified
  });
});

describe('Config.constructor', () => {
  it('does not throw without arguments', () => {
    expect(() => new Config()).not.toThrow();
  });

  it('does not throw with undefined as an argument', () => {
    expect(() => new Config(undefined)).not.toThrow();
  });

  it('does not throw with a valid object as an argument', () => {
    expect(() => new Config({ key: 'value' })).not.toThrow();
  });

  it('throws an error for an invalid argument (array)', () => {
    expect(() => new Config([])).toThrowError(
      "The 'config' argument must be an object"
    );
  });
});

describe('Config.has', () => {
  const config = new Config({
    users: [
      { name: 'simon', age: 22 },
      { name: 'james', age: 22 },
    ],
  });

  it('throws an error for undefined path', () => {
    expect(() => config.has(undefined)).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an empty path', () => {
    expect(() => config.has('')).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an invalid Dot-Notation expression', () => {
    expect(() => config.has('hello-world')).toThrowError(
      "The 'path' argument must be a valid Dot-Notation expression"
    );
  });

  it('returns true for existing paths', () => {
    expect(config.has('users')).toBeTruthy();
    expect(config.has('users[0]')).toBeTruthy();
    expect(config.has('users[1]')).toBeTruthy();
    expect(config.has('users[0].name')).toBeTruthy();
    expect(config.has('users[0].age')).toBeTruthy();
    expect(config.has('users[1].name')).toBeTruthy();
    expect(config.has('users[1].age')).toBeTruthy();
  });

  it('returns false for non-existing paths', () => {
    expect(config.has('users[6]')).toBeFalsy();
    expect(config.has('users[0][0]')).toBeFalsy();
    expect(config.has('users[6][0][7]')).toBeFalsy();
    expect(config.has('users[0].x')).toBeFalsy();
    expect(config.has('users.x.x')).toBeFalsy();
  });
});

describe('Config.get', () => {
  const config = new Config({
    users: [
      { name: 'simon', age: 22 },
      { name: 'james', age: 22 },
    ],
  });

  it('throws an error for undefined path', () => {
    expect(() => config.get(undefined)).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an empty path', () => {
    expect(() => config.get('')).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an invalid Dot-Notation expression', () => {
    expect(() => config.get('hello-world')).toThrowError(
      "The 'path' argument must be a valid Dot-Notation expression"
    );
  });

  it('returns the entire config for "*" path', () => {
    expect(config.get('*')).toEqual({
      users: [
        { name: 'simon', age: 22 },
        { name: 'james', age: 22 },
      ],
    });
  });

  it('returns the value at the specified path', () => {
    expect(config.get('users')).toEqual([
      { name: 'simon', age: 22 },
      { name: 'james', age: 22 },
    ]);

    expect(config.get('users[0]')).toEqual({ name: 'simon', age: 22 });
    expect(config.get('users[1]')).toEqual({ name: 'james', age: 22 });
    expect(config.get('users[1].name')).toBe('james');
    expect(config.get('users[1].age')).toBe(22);
    expect(config.get('users[0].name')).toBe('simon');
    expect(config.get('users[0].age')).toBe(22);
  });

  it('returns default value for non-existing paths', () => {
    expect(config.get('users[10]', 'def')).toBe('def');
    expect(config.get('users[0].name[1]', 'def')).toBe('def');
    expect(config.get('users[0].name.age', 'def')).toBe('def');
    expect(config.get('users[0].friends', 'def')).toBe('def');
  });

  it('throws an error for accessing undefined array item', () => {
    expect(() => config.get('users[10]')).toThrowError(
      "Trying to access an undefined array item '10'"
    );
  });

  it('throws an error for accessing array item on string', () => {
    expect(() => config.get('users[0].name[1]')).toThrowError(
      "Trying to access an array item on 'string'"
    );
  });

  it('throws an error for accessing object property on string', () => {
    expect(() => config.get('users[0].name.age')).toThrowError(
      "Trying to access an object property on 'string'"
    );
  });

  it('throws an error for accessing undefined object property', () => {
    expect(() => config.get('users[0].friends')).toThrowError(
      "Trying to access an undefined object property 'friends'"
    );
  });
});

describe('Config.set', () => {
  const config = new Config({
    users: [
      { name: 'simon', age: 33 },
      { name: 'james', age: 22 },
    ],
  });

  it('throws an error for undefined path', () => {
    expect(() => config.set(undefined, 'any')).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an empty path', () => {
    expect(() => config.set('', 'any')).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an invalid Dot-Notation expression', () => {
    expect(() => config.set('hello-world', 'any')).toThrowError(
      "The 'path' argument must be a valid Dot-Notation expression"
    );
  });

  it('throws an error for an invalid Dot-Notation expression with index', () => {
    expect(() => config.set('users[first]', 'any')).toThrowError(
      "The 'path' argument must be a valid Dot-Notation expression"
    );
  });

  it('throws an error for accessing undefined array item', () => {
    expect(() => config.set('users[10]', 'any')).toThrowError(
      "Trying to access an undefined array item '10'"
    );
  });

  it('throws an error for accessing array item on string', () => {
    expect(() => config.set('users[0].name[1]', 'any')).toThrowError(
      "Trying to access an array item on 'string'"
    );
  });

  it('throws an error for accessing object property on string', () => {
    expect(() => config.set('users[0].name.age', 'any')).toThrowError(
      "Trying to access an object property on 'string'"
    );
  });

  it('throws an error for accessing undefined object property', () => {
    expect(() => config.set('users[0].friends[0]', 'any')).toThrowError(
      "Trying to access an undefined object property 'friends'"
    );
  });

  it('sets the value at the specified path', () => {
    config.set('users[0].name', 'simo');
    expect(config.get('users[0].name')).toBe('simo');
  });

  it('sets a new property at the specified path', () => {
    config.set('users[0].gender', 'male');
    expect(config.get('users[0].gender')).toBe('male');
  });

  it('sets an object at the specified path', () => {
    config.set('users[1]', {
      name: 'james',
      age: 22,
      gender: 'male',
    });

    expect(config.get('users[1]')).toEqual({
      name: 'james',
      age: 22,
      gender: 'male',
    });
  });
});

describe('Config.delete', () => {
  const config = new Config({
    users: [
      { name: 'simon', age: 22 },
      { name: 'james', age: 22 },
    ],
  });

  it('throws an error for undefined path', () => {
    expect(() => config.delete(undefined)).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an empty path', () => {
    expect(() => config.delete('')).toThrowError(
      "The 'path' argument must be a valid path expression"
    );
  });

  it('throws an error for an invalid Dot-Notation expression', () => {
    expect(() => config.delete('hello-world')).toThrowError(
      "The 'path' argument must be a valid Dot-Notation expression"
    );
  });

  it('throws an error for accessing undefined array item', () => {
    expect(() => config.delete('users[10]')).toThrowError(
      "Trying to access an undefined array item '10'"
    );
  });

  it('throws an error for accessing array item on string', () => {
    expect(() => config.delete('users[0].name[1]')).toThrowError(
      "Trying to access an array item on 'string'"
    );
  });

  it('throws an error for accessing object property on string', () => {
    expect(() => config.delete('users[0].name.age')).toThrowError(
      "Trying to access an object property on 'string'"
    );
  });

  it('throws an error for accessing undefined object property', () => {
    expect(() => config.delete('users[0].friends')).toThrowError(
      "Trying to access an undefined object property 'friends'"
    );
  });

  it('deletes the property at the specified path', () => {
    config.delete('users[0].name');
    expect(config.get('users[0].name', null)).toBe(null);
  });

  it('deletes the object at the specified path', () => {
    config.delete('users[1]');
    expect(config.get('users[1]', null)).toBe(null);
  });

  it('deletes the array item at the specified path', () => {
    expect(config.get('users')).toEqual([{ age: 22 }]);
  });

  it('deletes all properties for "*" path', () => {
    config.delete('*');
    expect(config.get('*')).toEqual({});
  });
});
