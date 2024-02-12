import { Tool } from '../describers/Tool';
import { ExecFunc, Execable } from '../Component';
import { ComponentError } from '../../../errors/regex/ComponentError';
import { upperCase } from '../../modules/Text';
import {
  isFunction,
  isObject,
  isText,
  isVariableExp,
} from '../../modules/Check';

/* prettier-ignore */
export class FunctionStore {
  protected type: string;

  protected functions: Map<string, ExecFunc | Execable>;

  constructor(type: string) {
    this.type = type;
    this.functions = new Map();
  }

  public store($function: ExecFunc | Execable) {
    if (isFunction($function)) {
      if (this.functions.has($function.name)) {
        throw new ComponentError(`Duplicated ${this.type} name found '${$function.name}'`);
      }
      this.functions.set($function.name, $function);
    } 
    else if (isObject($function)) {
      if(!isFunction(($function as Execable).execute)) {
        throw new ComponentError(`Missing or invalid ${this.type} execution method`)
      }

      if(!isText(($function as Execable).name)) {
        throw new ComponentError(`${upperCase(this.type, 0)} name must be string but '${typeof $function.name}' given`)
      }

      if(!isVariableExp($function.name)) {
        throw new ComponentError(`${upperCase(this.type, 0)} name '${$function.name}' is not a valid function name`)
      }

      if (this.functions.has($function.name)) {
        throw new ComponentError(`Duplicated ${this.type} name found '${$function.name}'`);
      }

      this.functions.set($function.name, $function);
    }
    else {
      throw new ComponentError(
        `${upperCase(this.type, 0)} must be an ExecFunction or an Execable instance`
      );
    }
  }

  public exec(describer:  Tool, args?: any[]): any {
    const $function = this.functions.get(describer.name);

    if (!$function) {
      const name = describer.templateName;
      const line = describer.lineNumber;
      throw new ComponentError(
        `Undefined ${this.type} name '${describer.name}' in '${name}' at line number ${line}`
      );
    }

    try {
      if (isFunction($function)) {
        return args ? ($function as ExecFunc)(...args) : ($function as ExecFunc)();
      } 
      else if (isObject($function) && isFunction(($function as Execable).execute)) {
        return args ? ($function as Execable).execute(...args) : ($function as Execable).execute();
      } 
      else {
        throw new ComponentError(
          `${upperCase(this.type)} must be a function or a class implementing the Execable interface`
        );
      }
    } catch (error) {
      const name = describer.templateName;
      const line = describer.lineNumber;
      throw new ComponentError(`${(error as Error).message} in '${name} at line number ${line}'`);
    }
  }
}
