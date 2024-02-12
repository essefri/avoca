import { ConfigError } from '../../errors/ConfigError';
import { Test } from './Test';
import { TokenParser } from '../regex/parsers/TokenParser';

type Configuration = { [key: string]: any };

export class Config {
  private config: Configuration = {};

  constructor(config?: Configuration) {
    if (!Test.isUndefined(config) && !Test.isObject(config)) {
      throw new ConfigError(`The 'config' argument must be an object`);
    }

    this.config = config ? config : {};
  }

  /**
   * Mix multiple configuration objects in one
   * @param source configuration objects
   * @returns All in one configuration object
   */
  public static mix(...source: Array<Configuration>): Configuration {
    let config: Configuration = {};

    source.forEach((source) => {
      if (!Test.isObject(source)) {
        throw new ConfigError(`The 'source' argument must be an object`);
      }

      config = { ...config, ...source };
    });

    return config;
  }

  public static extract<T>(
    source: Configuration,
    keys: string[],
    def?: Configuration
  ): T {
    if (!Test.isArray(keys)) {
      throw new ConfigError(`The 'keys' argument must be an array of strings`);
    }

    if (!Test.isObject(source)) {
      throw new ConfigError(`The 'source' argument must be an object`);
    }

    if (!Test.isUndefined(def) && !Test.isObject(def)) {
      throw new ConfigError(`The 'def' argument must be an object`);
    }

    const result = {};

    keys.forEach((key) => {
      if (!Test.isText(key)) {
        throw new ConfigError(
          `The 'keys' argument must be an array of strings`
        );
      }

      if (!Test.hasProp(source, key)) {
        if (Test.isObject(def) && Test.hasProp(def, key)) {
          return ((result as { [key: string]: any })[key] = def[key]);
        }

        throw new ConfigError(`Missing property '${key}'`);
      }

      (result as { [key: string]: any })[key] = source[key];
    });

    return result as T;
  }

  /**
   * Tells if the configuration has a specific option
   * @param path Configuration path
   * @returns Boolean indecating wither if the path exists or not
   */
  public has(path: string): boolean {
    if (!Test.isText(path) || Test.isEmptyText(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid path expression`
      );
    }

    if (!Test._isNotation(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid Dot-Notation expression`
      );
    }

    let reference = this.config;
    const tokens = TokenParser.parseTokens(path, /[\[\]\.]/g);

    for (let $index = 0; $index < tokens.length; $index++) {
      const token = tokens[$index];

      if (Test._isPropName(token)) {
        if (!Test.isObject(reference)) return false;
        if (!Test.hasProp(reference, token)) return false;
        if (Test.isLastIteration(tokens, $index)) return true;
        reference = reference[token];
        continue;
      }

      if (Test._isInteger(token)) {
        if (!Test.isArray(reference)) return false;
        if (!Test.hasIndex(reference as Array<any>, parseInt(token, 10)))
          return false;
        if (Test.isLastIteration(tokens, $index)) return true;
        reference = reference[token];
        continue;
      }

      return false;
    }
  }

  /**
   * Reads a specific configuration option
   * @param path Configuration path
   * @param def Default value to return if the option does't exist
   * @returns The configuration value you are looking for
   * @note use '*' to extract everything
   */
  public get<T, D = undefined>(path: string, def?: D): T | D {
    if (path === '*') return this.config as T;

    if (!Test.isText(path) || Test.isEmptyText(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid path expression`
      );
    }

    if (!Test._isNotation(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid Dot-Notation expression`
      );
    }

    let reference = this.config;

    const tokens = TokenParser.parseTokens(path, /[\[\]\.]/g);

    for (let $index = 0; $index < tokens.length; $index++) {
      const token = tokens[$index];

      if (Test._isPropName(token)) {
        if (!Test.isObject(reference)) {
          if (!Test.isUndefined(def)) return def as D;

          throw new ConfigError(
            `Trying to access an object property on '${typeof reference}'`
          );
        }

        if (!Test.hasProp(reference, token)) {
          if (!Test.isUndefined(def)) return def as D;

          throw new ConfigError(
            `Trying to access an undefined object property '${token}'`
          );
        }

        if (Test.isLastIteration(tokens, $index)) return reference[token] as T;

        reference = reference[token];

        continue;
      }

      if (Test._isInteger(token)) {
        if (!Test.isArray(reference)) {
          if (!Test.isUndefined(def)) return def as D;

          throw new ConfigError(
            `Trying to access an array item on '${typeof reference}'`
          );
        }

        if (!Test.hasIndex(reference as Array<any>, parseInt(token, 10))) {
          if (!Test.isUndefined(def)) return def as D;

          throw new ConfigError(
            `Trying to access an undefined array item '${token}'`
          );
        }

        if (Test.isLastIteration(tokens, $index)) {
          return reference[parseInt(token, 10)] as T;
        }

        reference = reference[parseInt(token, 10)];
        continue;
      }

      throw new ConfigError(`Invalid token ${token}`);
    }
  }

  /**
   * Creates and Updates a specific configuration option
   * @param path Configuration path
   * @param value The value to store
   */
  public set(path: string, value: any) {
    if (!Test.isText(path) || Test.isEmptyText(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid path expression`
      );
    }

    if (!Test._isNotation(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid Dot-Notation expression`
      );
    }

    let reference = this.config;

    const tokens = TokenParser.parseTokens(path, /[\[\]\.]/g);

    for (let $index = 0; $index < tokens.length; $index++) {
      const token = tokens[$index];

      if (Test._isPropName(token)) {
        if (!Test.isObject(reference)) {
          throw new ConfigError(
            `Trying to access an object property on '${typeof reference}'`
          );
        }

        if (!Test.hasProp(reference, token)) {
          // create
          if (Test.isLastIteration(tokens, $index)) {
            reference[token] = value;
            continue;
          }

          throw new ConfigError(
            `Trying to access an undefined object property '${token}'`
          );
        }

        // update
        if (Test.isLastIteration(tokens, $index)) {
          reference[token] = value;
          continue;
        }

        reference = reference[token];

        continue;
      }

      if (Test._isInteger(token)) {
        if (!Test.isArray(reference)) {
          throw new ConfigError(
            `Trying to access an array item on '${typeof reference}'`
          );
        }

        if (!Test.hasIndex(reference as Array<any>, parseInt(token, 10))) {
          throw new ConfigError(
            `Trying to access an undefined array item '${token}'`
          );
        }

        if (Test.isLastIteration(tokens, $index)) {
          reference[parseInt(token, 10)] = value;
        }

        reference = reference[parseInt(token, 10)];
        continue;
      }

      throw new ConfigError(`Invalid token ${token}`);
    }
  }

  /**
   * Delete a specific configuration option
   * @param path Configuration path
   * @note use '*' to delete everything
   */
  public delete(path: string) {
    if (path === '*') return (this.config = {});

    if (!Test.isText(path) || Test.isEmptyText(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid path expression`
      );
    }

    if (!Test._isNotation(path)) {
      throw new ConfigError(
        `The 'path' argument must be a valid Dot-Notation expression`
      );
    }

    let reference = this.config;

    const tokens = TokenParser.parseTokens(path, /[\[\]\.]/g);

    for (let $index = 0; $index < tokens.length; $index++) {
      const token = tokens[$index];

      if (Test._isPropName(token)) {
        if (!Test.isObject(reference)) {
          throw new ConfigError(
            `Trying to access an object property on '${typeof reference}'`
          );
        }

        if (!Test.hasProp(reference, token)) {
          throw new ConfigError(
            `Trying to access an undefined object property '${token}'`
          );
        }

        if (Test.isLastIteration(tokens, $index)) {
          delete reference[token];
          continue;
        }

        reference = reference[token];
        continue;
      }

      if (Test._isInteger(token)) {
        if (!Test.isArray(reference)) {
          throw new ConfigError(
            `Trying to access an array item on '${typeof reference}'`
          );
        }

        if (!Test.hasIndex(reference as Array<any>, parseInt(token, 10))) {
          throw new ConfigError(
            `Trying to access an undefined array item '${token}'`
          );
        }

        if (Test.isLastIteration(tokens, $index)) {
          (reference as Array<any>).splice(parseInt(token, 10), 1);
          continue;
        }

        reference = reference[parseInt(token, 10)];
        continue;
      }

      throw new ConfigError(`Invalid token ${token}`);
    }
  }
}
