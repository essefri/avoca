import { randomUUID } from 'crypto';
import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Test } from '../../utils/Test';
import { InternalError } from '../../../errors/regex/InternalError';

type StringPlaceholder = {
  string: string;
  placeholder: string;
};

export class TokenParser {
  private static parseStrings(template: string): string[] | null {
    const match = template.match(/'[^']*'|"["^]*"/g);
    return match && match.length > 0 ? match : null;
  }

  private static generatePlaceholders(
    strings: string[] | null
  ): StringPlaceholder[] | null {
    const placeholders: StringPlaceholder[] = [];
    if (strings) {
      strings.forEach((string) => {
        const placeholder = `'${randomUUID()}'`.replace(/-/g, '');
        placeholders.push({ string, placeholder });
      });

      return placeholders;
    }
    return null;
  }

  private static replaceStrings(
    template: string,
    values: StringPlaceholder[]
  ): string {
    values.forEach((value) => {
      template = template.replace(value.string, value.placeholder);
    });
    return template;
  }

  private static replacePlaceholders(
    tokens: string[],
    values: StringPlaceholder[]
  ): string[] {
    tokens.forEach((token, index) => {
      values.forEach((value) => {
        if (token.includes(value.placeholder)) {
          tokens[index] = tokens[index].replace(
            value.placeholder,
            value.string
          );
        }
      });
    });

    return tokens;
  }

  /**
   * Parses tokens out of the given pattern
   * @param pattern The text to parse from
   * @param sep The seperators
   * @returns An array of tokens
   * @note strings are excluded from matching
   */
  public static parseTokens(pattern: string, sep: RegExp): string[] {
    // exclude strings from matching
    let placeholders = TokenParser.generatePlaceholders(
      TokenParser.parseStrings(pattern)
    );

    // replace strings with placeholders
    if (placeholders) {
      pattern = TokenParser.replaceStrings(pattern, placeholders);
    }

    const tokens = pattern
      .split(sep)
      .filter((token) => token.trim() !== '')
      .map((token) => token.trim());

    // put strings back
    return placeholders
      ? TokenParser.replacePlaceholders(tokens, placeholders)
      : tokens;
  }

  public static parseArguments(
    tokens: string[],
    componentName: string,
    lineNumber: number
  ): string[] | null {
    if (!Test.isNonEmptyArray(tokens)) {
      throw new InternalError('Invalid array of tokens detected');
    }

    let level = 1;

    const $arguments: string[] = [];
    const token = tokens.shift() as string;

    if (token !== '(') {
      throw new ComponentSyntaxError(
        `Unexpected token in ${componentName} at line number ${lineNumber}`
      );
    }

    while (tokens.length > 0) {
      const token = tokens.shift() as string;

      if (token === '(') {
        level = level + 1;
      } else if (token === ')') {
        if (level === 0) {
          throw new ComponentSyntaxError(
            `Unexpected closing parentheses in ${componentName} at line number ${lineNumber}`
          );
        }
        level = level - 1;
      }

      if (level === 0) break;

      $arguments.push(token);
    }

    if (level !== 0) {
      throw new ComponentSyntaxError(
        `Unexpected opening parentheses in ${componentName} at line number ${lineNumber}`
      );
    }

    return $arguments.length > 0 ? $arguments : null;
  }
}
