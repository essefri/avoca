import { Local } from '../describers/Local';
import { Global } from '../describers/Global';
import { ComponentError } from '../../../errors/regex/ComponentError';
import {
  isArray,
  isIntegerExp,
  isObject,
  isText,
  isVariableExp,
} from '../../modules/Check';
import { upperCase } from '../../modules/Text';

type PropertyToken = { type: 'property'; value: string };
type IndexToken = { type: 'index'; value: number };
type PathTokens = Array<PropertyToken | IndexToken>;

/* prettier-ignore */
export class VariableStore {
  protected type: string;

  protected variables: Map<string, any>;

  constructor(type: string) {
    this.type = type;
    this.variables = new Map();
  }

  public store(name: string, value: any) {
    if(!isText(name)) {
      throw new ComponentError(`${upperCase(this.type, 0)} name must be string but '${typeof name}' given`)
    }

    if(!isVariableExp(name)) {
      throw new ComponentError(`${upperCase(this.type, 0)} name '${name}' is not a valid variable name`)
    }

    if (this.variables.has(name)) {
      throw new ComponentError(
        `Duplicated ${this.type} variable name found '${name}'`
      );
    }

    this.variables.set(name, value);
  }

  public resolve(describer: Local | Global): any {
    let variable = this.variables.get(describer.name);

    if (!variable) {
      throw new ComponentError(
        `Undefined ${this.type} variable name in ${describer.templateName} at line number ${describer.lineNumber}`
      );
    }

    if (describer.path) {
      const tokens = this.convert(describer.path);

      tokens.forEach((token) => {
        if (token.type === 'property') {
          if (!isObject(variable)) {
            const name = describer.templateName;
            const line = describer.lineNumber;
            throw new ComponentError(
              `Trying to access an object property on '${typeof variable}' in ${name} at line number ${line}`
            );
          }

          variable = variable[token.value];
        } 
        else if (token.type === 'index') {
          if (!isArray(variable)) {
            const name = describer.templateName;
            const line = describer.lineNumber;
            throw new ComponentError(
              `Trying to access an array element on '${typeof variable}' in ${name} at line number ${line}`
            );
          }

          variable = variable[token.value];
        }
      });
    }

    return variable;
  }

  protected convert(path: string): PathTokens {
    const tokens: PathTokens = [];

    path
    .split(/[\.\[\]]/)
    .map((token) => token.trim())
    .filter((token) => token.length !== 0)
    .forEach((token) => {
      if (isVariableExp(token)) tokens.push({ type: 'property', value: token });
      else if (isIntegerExp(token)) tokens.push({ type: 'index', value: Number(token) });
      else throw new ComponentError(`Invalid path token found '${token}'`);
    });

    return tokens;
  }
}
