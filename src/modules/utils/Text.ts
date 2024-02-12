import { Test } from './Test';

import { randomUUID } from 'crypto';

class TextError extends Error {}

export class Text {
  public static has(target: string, test: RegExp | string): boolean {
    if (!Test.isText(target)) return false;
    if (!Test.isRegExp(test) && !Test.isText(test)) return false;
    if (Test.isRegExp(test)) return (test as RegExp).test(target);
    return Text.toRegex(test as string).test(target);
  }

  public static toRegex(target: string, flags?: string): RegExp {
    const regex = target.replace(/\*/, '.*');
    return new RegExp(`${regex}`, flags);
  }

  public static toUpperCase(
    target: string,
    start?: number,
    end?: number
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (
      start &&
      (!Test.isInteger(start) || start < 0 || start >= target.length)
    ) {
      throw new TextError(`Invalid 'start' argument.`);
    }

    if (end && (!Test.isInteger(end) || end <= start || end > target.length)) {
      throw new TextError(`Invalid 'end' argument.`);
    }

    return target
      .split('')
      .map((char, index) => {
        if (
          (Test.isUndefined(start) || index >= start) &&
          (Test.isUndefined(end) || index < end)
        ) {
          return char.toUpperCase();
        }
        return char;
      })
      .join('');
  }

  public static toUpperCaseWhen(target: string, test: RegExp | string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(test) && !Test.isRegExp(test)) {
      throw new TextError(`The 'test' argument must be a string or RegExp`);
    }

    if (Test.isText(test)) test = Text.toRegex(test as string, 'g');

    return target.replace(test as RegExp, (match) => match.toUpperCase());
  }

  public static toLowerCase(
    target: string,
    start?: number,
    end?: number
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (
      start &&
      (!Test.isInteger(start) || start < 0 || start >= target.length)
    ) {
      throw new TextError(`Invalid 'start' argument.`);
    }

    if (end && (!Test.isInteger(end) || end <= start || end > target.length)) {
      throw new TextError(`Invalid 'end' argument.`);
    }

    return target
      .split('')
      .map((char, index) => {
        if (
          (Test.isUndefined(start) || index >= start) &&
          (Test.isUndefined(end) || index < end)
        ) {
          return char.toLowerCase();
        }
        return char;
      })
      .join('');
  }

  public static toLowerCaseWhen(target: string, test: RegExp | string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(test) && !Test.isRegExp(test)) {
      throw new TextError(`The 'test' argument must be a string or RegExp`);
    }

    if (Test.isText(test)) test = this.toRegex(test as string, 'g');

    return target.replace(test as RegExp, (match) => match.toLowerCase());
  }

  public static toPlural(
    singular: string,
    count: number = 2,
    dictionary?: { [key: string]: string }
  ): string {
    if (!Test.isText(singular)) {
      throw new TextError(`The 'singular' argument must be a string`);
    }

    if (!Test.isInteger(count)) {
      throw new TextError(`The 'count' argument must be an integer`);
    }

    if (!Test.isUndefined(dictionary) && !Test.isObject(dictionary)) {
      throw new TextError(`The 'dictionary' argument must be an object`);
    }

    if (count < 2) return singular;

    if (Test.isObject(dictionary)) {
      if (dictionary[singular]) return dictionary[singular].toLowerCase();
    }

    singular = singular.trim();

    // Compounded Nouns
    if (Text.has(singular, /^(?<singular>[a-z]+)-/i)) {
      return Text.toPlural(
        /^(?<singular>[a-z]+)-/i.exec(singular).groups.singular
      )
        .concat('-', /^[a-z]+-(?<rest>.+)/i.exec(singular).groups.rest)
        .toLowerCase();
    }

    // add s, x, sh, ch, z with es
    if (Text.has(singular, /(?:[sc]h|s|z|x)$/i)) {
      return singular.concat('es').toLowerCase();
    }

    // replace "y" with "ies" if Preceded by a Consonant
    if (Text.has(singular, /(?:[bcdfghjklmnpqrstvwxyz]y)$/i)) {
      return singular.replace(/(?:y)$/i, 'ies').toLowerCase();
    }

    // add "s" to "y" if Preceded by a Vowel
    if (Text.has(singular, /(?:[aeiou]y)$/i)) {
      return singular.concat('s').toLowerCase();
    }

    // add "es" to "o" if Preceded by a Consonant
    if (Text.has(singular, /(?:[bcdfghjklmnpqrstvwxyz]o)$/i)) {
      return singular.concat('es').toLowerCase();
    }

    // add "s" to "o" if Preceded by a Vowel
    if (Text.has(singular, /(?:[aeiou]o)$/i)) {
      return singular.concat('s').toLowerCase();
    }

    // relace "f" or "fe" to "ves"
    if (Text.has(singular, /(?:[f]e?)$/i)) {
      return singular.replace(/(?:[f]e?)$/i, 'ves').toLowerCase();
    }

    return singular.concat('s').toLowerCase();
  }

  public static toSingular(
    plural: string,
    dictionary?: { [key: string]: string },
    count: number = 1
  ): string {
    if (!Test.isText(plural)) {
      throw new TextError(`The 'plural' argument must be a string`);
    }

    if (!Test.isInteger(count)) {
      throw new TextError(`The 'count' argument must be an integer`);
    }

    if (!Test.isUndefined(dictionary) && !Test.isObject(dictionary)) {
      throw new TextError(`The 'dictionary' argument must be an object`);
    }

    if (count > 1) return plural.toLowerCase();

    if (Test.isObject(dictionary)) {
      if (dictionary[plural]) return dictionary[plural].toLowerCase();
    }

    plural = plural.trim();

    // Compounded Nouns
    if (Text.has(plural, /^(?<plural>[a-z]+)-/i)) {
      return Text.toSingular(/^(?<plural>[a-z]+)-/i.exec(plural).groups.plural)
        .concat('-', /^[a-z]+-(?<rest>.+)/i.exec(plural).groups.rest)
        .toLowerCase();
    }

    // replace "ies" with "y" : babies -> baby
    if (Text.has(plural, /(?:[bcdfghjklmnpqrstvwxyz]ies)$/i)) {
      return plural.replace(/(?:ies)$/i, 'y').toLowerCase();
    }

    // remove es and s : boxes -> box
    return plural.replace(/e?s$/i, '').toLowerCase();
  }

  public static toKamelCase(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .replace(/^[0-9\s]+/, '')
      .split(/\s+/)
      .filter((item) => item.trim() !== '')
      .map((word, index) => {
        if (index === 0) return word;
        return Test._isNumber(word) ? word : Text.toUpperCase(word, 0, 1);
      })
      .join('');
  }

  public static toPascalCase(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .replace(/^[0-9\s]+/, '')
      .split(/\s+/)
      .filter((item) => item.trim() !== '')
      .map((word) =>
        Test._isNumber(word) ? word : Text.toUpperCase(word, 0, 1)
      )
      .join('');
  }

  public static toSnakeCase(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .replace(/^[0-9\s]+/, '')
      .trim()
      .split(/\s+/)
      .join('_');
  }

  public static toKababCase(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .replace(/^[0-9\s]+/, '')
      .trim()
      .split(/\s+/)
      .join('-');
  }

  public static toTitle(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target.charAt(0).toUpperCase().concat(target.slice(1).toLowerCase());
  }

  public static toSlug(target: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .trim()
      .split(/\s+/)
      .join('-');
  }

  public static toEllipsis(target: string, length: number): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(length)) {
      throw new TextError(`The 'length' argument must be an integer`);
    }

    return target.length <= length
      ? target
      : target.slice(0, length).trim().concat(' ...');
  }

  public static id(prefix?: string, sep: string = ' : '): string {
    if (!Test.isUndefined(prefix) && !Test.isText(prefix)) {
      throw new TextError(`The 'prefix' argument must be a string`);
    }

    if (!Test.isUndefined(sep) && !Test.isText(sep)) {
      throw new TextError(`The 'sep' argument must be a string`);
    }

    return Test.isText(prefix)
      ? prefix.concat(sep, randomUUID())
      : randomUUID();
  }

  public static prefix(target: string, portion: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    return portion.concat(target);
  }

  public static suffix(target: string, portion: string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    return target.concat(portion);
  }

  public static infix(target: string, portion: string, index: number): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    if (!Test.isInteger(index) && !Test.isInfinity(index)) {
      throw new TextError(
        `The 'index' argument must be an integer or Infinity`
      );
    }

    return index < 0
      ? target
      : target.slice(0, index).concat(portion, target.slice(index));
  }

  public static prefixed(target: string, portion: string): boolean {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    return target.startsWith(portion);
  }

  public static suffixed(target: string, portion: string): boolean {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    return target.endsWith(portion);
  }

  public static infixed(
    target: string,
    portion: string,
    index: number
  ): boolean {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(portion)) {
      throw new TextError(`The 'portion' argument must be a string`);
    }

    if (!Test.isInteger(index) && !Test.isInfinity(index)) {
      throw new TextError(
        `The 'index' argument must be an integer or Infinity`
      );
    }

    return index < 0 ? false : target.slice(index).startsWith(portion);
  }

  public static exclude(target: string, regex: RegExp | string): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isRegExp(regex) && !Test.isText(regex)) {
      throw new TextError(`The 'regex' argument must be RegExp or string`);
    }

    if (Test.isText(regex)) regex = this.toRegex(regex as string);

    return target.replace(regex, '').trim();
  }

  public static extract(target: string, start: number, end?: number) {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(start)) {
      throw new TextError(`The 'start' argument must be an integer`);
    }

    if (Test.isDefined(end) && !Test.isInteger(end) && !Test.isInfinity(end)) {
      throw new TextError(`The 'end' argument must be an integer`);
    }

    return target.slice(start, end);
  }

  public static expand(target: string, length: number, fill: string = ' ') {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(length)) {
      throw new TextError(`The 'length' argument must be an integer`);
    }

    if (!Test.isText(fill)) {
      throw new TextError(`The 'fill' argument must be a string`);
    }

    if (target.length >= length) return target;

    let count = 1;

    while (target.length < length) {
      target = Test.isEven(count)
        ? Text.prefix(target, fill)
        : Text.suffix(target, fill);

      count++;
    }

    return target;
  }

  public static expandLeft(target: string, length: number, fill: string = ' ') {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(length)) {
      throw new TextError(`The 'length' argument must be an integer`);
    }

    if (!Test.isText(fill)) {
      throw new TextError(`The 'fill' argument must be a string`);
    }

    if (target.length >= length) return target;

    while (target.length < length) {
      target = Text.prefix(target, fill);
    }

    return target;
  }

  public static expandRight(
    target: string,
    length: number,
    fill: string = ' '
  ) {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(length)) {
      throw new TextError(`The 'length' argument must be an integer`);
    }

    if (!Test.isText(fill)) {
      throw new TextError(`The 'fill' argument must be a string`);
    }

    if (target.length >= length) return target;

    while (target.length < length) {
      target = Text.suffix(target, fill);
    }

    return target;
  }

  public static trim(
    target: string,
    chars: string = ' \t\n\r\0\x0B\f\b'
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(chars)) {
      throw new TextError(`The 'chars' argument must be a string`);
    }

    return target.replace(new RegExp(`^[${chars}]+|[${chars}]+$`, 'g'), '');
  }

  public static trimLeft(
    target: string,
    chars: string = ' \t\n\r\0\x0B\f\b'
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(chars)) {
      throw new TextError(`The 'chars' argument must be a string`);
    }

    return target.replace(new RegExp(`^[${chars}]+`, 'g'), '');
  }

  public static trimRight(
    target: string,
    chars: string = ' \t\n\r\0\x0B\f\b'
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(chars)) {
      throw new TextError(`The 'chars' argument must be a string`);
    }

    return target.replace(new RegExp(`[${chars}]+$`, 'g'), '');
  }

  public static replaceFirst(
    target: string,
    search: string | RegExp,
    replace: string
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(search) && !Test.isRegExp(search)) {
      throw new TextError(`The 'search' argument must be a string or RegExp`);
    }

    if (!Test.isText(replace)) {
      throw new TextError(`The 'replace' argument must be a string`);
    }

    if (Test.isText(search)) search = Text.toRegex(search as string);

    if (Test.hasFlag(search as RegExp, 'g')) {
      search = new RegExp(
        (search as RegExp).source,
        (search as RegExp).flags.replace('g', '')
      );
    }

    return target.replace(search, replace);
  }

  public static replaceLast(
    target: string,
    search: string | RegExp,
    replace: string
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(search) && !Test.isRegExp(search)) {
      throw new TextError(`The 'search' argument must be a string or RegExp`);
    }

    if (!Test.isText(replace)) {
      throw new TextError(`The 'replace' argument must be a string`);
    }

    if (Test.isText(search)) search = Text.toRegex(search as string, 'g');

    if (Test.isRegExp(search) && !Test.hasFlag(search as RegExp, 'g')) {
      search = new RegExp(
        (search as RegExp).source,
        (search as RegExp).flags.concat('g')
      );
    }

    const matches = Text.matches(target, search);

    if (matches) {
      const last = matches.pop();

      return target
        .slice(0, last.index)
        .concat(target.slice(last.index).replace(last.match, replace));
    }

    return target;
  }

  public static replaceNth(
    target: string,
    search: string | RegExp,
    replace: string,
    nth: number
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(search) && !Test.isRegExp(search)) {
      throw new TextError(`The 'search' argument must be a string or RegExp`);
    }

    if (!Test.isText(replace)) {
      throw new TextError(`The 'replace' argument must be a string`);
    }

    if (!Test.isInteger(nth)) {
      throw new TextError(`The 'nth' argument must be an integer`);
    }

    if (Test.isText(search)) search = Text.toRegex(search as string, 'g');

    if (Test.isRegExp(search) && !Test.hasFlag(search as RegExp, 'g')) {
      search = new RegExp(
        (search as RegExp).source,
        (search as RegExp).flags.concat('g')
      );
    }

    const matches = Text.matches(target, search);

    if (matches && matches[nth - 1]) {
      const $match = matches[nth - 1];

      return target
        .slice(0, $match.index)
        .concat(target.slice($match.index).replace($match.match, replace));
    }

    return target;
  }

  public static replaceAll(
    target: string,
    search: string | RegExp,
    replace: string
  ): string {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(search) && !Test.isRegExp(search)) {
      throw new TextError(`The 'search' argument must be a string or RegExp`);
    }

    if (!Test.isText(replace)) {
      throw new TextError(`The 'replace' argument must be a string`);
    }

    if (Test.isText(search)) search = Text.toRegex(search as string, 'g');

    if (Test.isRegExp(search) && !Test.hasFlag(search as RegExp, 'g')) {
      search = new RegExp(
        (search as RegExp).source,
        (search as RegExp).flags.concat('g')
      );
    }

    return target.replace(search as RegExp, replace);
  }

  public static countOf(target: string, regex: string | RegExp): number {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(regex) && !Test.isRegExp(regex)) {
      throw new TextError(`The 'regex' argument must be a string or RegExp`);
    }

    if (Test.isText(regex)) regex = Text.toRegex(regex as string, 'g');

    if (Test.isRegExp(regex) && !Test.hasFlag(regex as RegExp, 'g')) {
      regex = new RegExp(
        (regex as RegExp).source,
        (regex as RegExp).flags.concat('g')
      );
    }

    const match = target.match(regex);

    return match ? match.length : 0;
  }

  public static indexOf(
    target: string,
    regex: string | RegExp,
    pos?: number
  ): number | undefined {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(regex) && !Test.isRegExp(regex)) {
      throw new TextError(`The 'regex' argument must be a string or RegExp`);
    }

    if (!Test.isUndefined(pos) && !Test.isInteger(pos)) {
      throw new TextError(`The 'pos' argument must be an integer`);
    }

    if (Test.isText(regex)) {
      const $index = target.indexOf(regex as string, pos);
      return $index < 0 ? undefined : $index;
    }

    if (Test.isInteger(pos)) {
      const $index = target.slice(pos).search(regex);
      return $index < 0 ? undefined : $index + target.slice(0, pos).length;
    }

    return target.search(regex) < 0 ? undefined : target.search(regex);
  }

  public static indexesOf(
    target: string,
    regex: string | RegExp
  ): Array<{ start: number; end: number }> | undefined {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(regex) && !Test.isRegExp(regex)) {
      throw new TextError(`The 'regex' argument must be a string or RegExp`);
    }

    let match;

    const indexes: Array<{ start: number; end: number }> = [];

    if (Test.isText(regex)) regex = Text.toRegex(regex as string, 'g');

    if (Test.isRegExp(regex) && !Test.hasFlag(regex as RegExp, 'g')) {
      regex = new RegExp(
        (regex as RegExp).source,
        (regex as RegExp).flags.concat('g')
      );
    }

    while ((match = (regex as RegExp).exec(target)) !== null) {
      indexes.push({ start: match.index, end: match.index + match[0].length });
    }

    return indexes.length > 0 ? indexes : undefined;
  }

  public static lastIndexOf(
    target: string,
    regex: string | RegExp
  ): number | undefined {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(regex) && !Test.isRegExp(regex)) {
      throw new TextError(`The 'regex' argument must be a string or RegExp`);
    }

    if (Test.isText(regex)) regex = Text.toRegex(regex as string, 'g');

    if (Test.isRegExp(regex) && !Test.hasFlag(regex as RegExp, 'g')) {
      regex = new RegExp(
        (regex as RegExp).source,
        (regex as RegExp).flags.concat('g')
      );
    }

    const matches = Text.matches(target, regex as RegExp);

    if (matches) return matches.pop().index;

    return undefined;
  }

  public static splitAt(
    target: string,
    index: number,
    cut: boolean = true
  ): Array<string> {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isInteger(index)) {
      throw new TextError(`The 'index' argument must be an integer`);
    }

    if (!Test.isBoolean(cut)) {
      throw new TextError(`The 'cut' argument must be boolean`);
    }

    return [target.slice(0, index), target.slice(cut ? index + 1 : index)];
  }

  public static chars(target: string) {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target.split('');
  }

  public static words(target: string) {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    return target.split(' ');
  }

  public static matches(
    target: string,
    regex: string | RegExp
  ):
    | Array<{
        index: number;
        match: string;
        groups: undefined | { [key: string]: string };
      }>
    | undefined {
    if (!Test.isText(target)) {
      throw new TextError(`The 'target' argument must be a string`);
    }

    if (!Test.isText(regex) && !Test.isRegExp(regex)) {
      throw new TextError(`The 'regex' argument must be a string or RegExp`);
    }

    let match;

    const matches: Array<{
      index: number;
      match: string;
      groups: undefined | { [key: string]: string };
    }> = [];

    if (Test.isText(regex)) regex = Text.toRegex(regex as string, 'g');

    if (Test.isRegExp(regex) && !Test.hasFlag(regex as RegExp, 'g')) {
      regex = new RegExp(
        (regex as RegExp).source,
        (regex as RegExp).flags.concat('g')
      );
    }

    while ((match = (regex as RegExp).exec(target)) !== null) {
      matches.push({
        index: match.index,
        match: match[0],
        groups: match.groups,
      });
    }

    return matches.length > 0 ? matches : undefined;
  }
}
