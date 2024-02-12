import {
  isArray,
  isIntegerExp,
  isNonEmptyArray,
  isObjectOwnProps,
  isObject,
  isUndefined,
  isVariableExp,
} from '../../modules/Check';
import { Reference } from '../describers/Reference';
import { ComponentError } from '../../../errors/regex/ComponentError';
import { InternalError } from '../../../errors/regex/InternalError';

type Scope = Map<string, any>;
export type Variable = {
  name: string;
  value: any;
};

export class ScopeStore {
  scopes: Scope[];

  constructor() {
    this.scopes = [];
  }

  validateVariables(variables: Variable[]) {
    if (isNonEmptyArray(variables)) {
      variables.forEach((variable) => {
        const props = ['name', 'value'];
        if (!isObjectOwnProps(variable, props)) {
          throw new InternalError('Invalid variables detected');
        }
      });
    } else {
      throw new InternalError('Invalid varibales detected');
    }
  }

  create(variables: Variable[], templateName: string, lineNumber: number) {
    this.validateVariables(variables);

    const scope = new Map();
    variables.forEach((variable) => {
      if (scope.has(variable.name)) {
        throw new ComponentError(
          `Deplicated variables names '${variable.name}' in '${templateName}' at line number ${lineNumber} `
        );
      }
      scope.set(variable.name, variable.value);
    });
    this.scopes.unshift(scope);
  }

  read(ref: Reference) {
    for (let index = 0; index < this.scopes.length; index++) {
      const scope = this.scopes[index];

      if (scope.has(ref.name)) {
        if (ref.path) {
          return this.resolve(
            ref.path,
            scope.get(ref.name),
            ref.templateName,
            ref.lineNumber
          );
        }

        return scope.get(ref.name);
      }
    }

    throw new ComponentError(
      `Undefined variable name '${ref.name}' in '${ref.templateName}' at line number ${ref.lineNumber} `
    );
  }

  update(variables: Variable[]) {
    this.validateVariables(variables);

    const scope = this.scopes.shift() as Scope;

    if (isUndefined(scope)) {
      throw new InternalError('Undefined scope object detected');
    }

    variables.forEach((variable) => {
      if (scope.has(variable.name)) {
        scope.set(variable.name, variable.value);
      } else {
        throw new InternalError('Trying to update undefined scope variable');
      }
    });

    this.scopes.unshift(scope);
  }

  delete() {
    const scope = this.scopes.shift();
    if (isUndefined(scope)) {
      throw new InternalError('Trying to delete undefined scope');
    }
  }

  public resolve(
    path: string,
    ref: any,
    templateName: string,
    lineNumber: number
  ): any {
    path
      .split(/[\.\[\]]/)
      .map((token) => token.trim())
      .filter((token) => token.length !== 0)
      .forEach((token) => {
        if (isVariableExp(token)) {
          if (!isObject(ref)) {
            throw new ComponentError(
              `Trying to access an object property on '${typeof ref}' in '${templateName}' at line number ${lineNumber}`
            );
          }
          ref = ref[token];
        } else if (isIntegerExp(token)) {
          if (!isArray(ref)) {
            throw new ComponentError(
              `Trying to access an array element on '${typeof ref}' in '${templateName}' at line number ${lineNumber}`
            );
          }
          ref = ref[token];
        } else {
          throw new ComponentError(
            `Invalid reference path token found '${token}' in '${templateName}' at line number ${lineNumber}`
          );
        }
      });

    return ref;
  }
}
