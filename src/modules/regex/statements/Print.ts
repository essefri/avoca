import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement, TemplateParser } from '../parsers/TemplateParser';
import { TokenParser } from '../parsers/TokenParser';

import { Reference } from '../describers/Reference';
import { Scalar } from '../describers/Scalar';
import { Local } from '../describers/Local';
import { Global } from '../describers/Global';
import { Tool } from '../describers/Tool';

/* prettier-ignore */
export class Print extends TemplateParser {

  describer: Scalar | Local | Global | Tool | Reference;

  constructor(statement: Statement) {
    super(statement.templateName);

    const args = this.parseArguments(statement.definition, statement.lineNumber, 'print');
    const tokens = TokenParser.parseTokens(args, /([()])/);

    if (tokens.length === 0) {
      throw new ComponentSyntaxError(
        `Missing print statement value in '${statement.templateName}' at line number ${statement.lineNumber}`
      );
    }

    if (tokens.length === 1) {
      const token = tokens.shift() as string;

      if (Scalar.check(token)) {
        this.describer = new Scalar(token, statement.templateName, statement.lineNumber);
      }
      else if (Local.check(token)) {
        this.describer = new Local(token, statement.templateName, statement.lineNumber);
      } 
      else if (Global.check(token)) {
        this.describer = new Global(token, statement.templateName, statement.lineNumber);
      } 
      else if (Reference.check(token)) {
        this.describer = new Reference(token, statement.templateName, statement.lineNumber);
      } 
      else {
        throw new ComponentSyntaxError(
          `Invalid print statement value provided in '${statement.templateName}' at line number ${statement.lineNumber}`
        );
      }
    } else {
      const token = tokens.shift() as string;

      if (Tool.check(token)) {
        const $arguments = TokenParser.parseArguments(tokens, statement.templateName, statement.lineNumber);
        const tool = $arguments ? token.concat('(' , ...$arguments, ')') : token.concat('()');
        this.describer = new Tool(tool, statement.templateName, statement.lineNumber);
      } 
      else {
        throw new ComponentSyntaxError(
          `Invalid print statement value provided in '${statement.templateName}' at line number ${statement.lineNumber}`
        );
      }
    }
  }
}
