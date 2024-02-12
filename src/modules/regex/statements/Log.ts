import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement, TemplateParser } from '../parsers/TemplateParser';
import { TokenParser } from '../parsers/TokenParser';
import { Reference } from '../describers/Reference';
import { Scalar } from '../describers/Scalar';
import { Local } from '../describers/Local';
import { Global } from '../describers/Global';
import { Tool } from '../describers/Tool';

/* prettier-ignore */
export class Log extends TemplateParser {
  
  describer: Scalar | Global | Local | Tool | Reference;

  constructor(statement: Statement) {
    super(statement.templateName);

    const $arguments = this.parseArguments(statement.definition, statement.lineNumber, statement.type);
    const tokens = TokenParser.parseTokens($arguments, /([()])/);

    if (tokens.length === 0) {
      throw new ComponentSyntaxError(
        `Missing log statement value in '${this.templateName}' at line number ${statement.lineNumber}`
      );
    }

    if (tokens.length === 1) {
      const token = tokens.shift() as string;

      if (Scalar.check(token)) {
        this.describer = new Scalar(token, this.templateName, statement.lineNumber);
      }
      else if (Global.check(token)) {
        this.describer = new Global(token, this.templateName, statement.lineNumber);
      } 
      else if (Local.check(token)) {
        this.describer = new Local(token, this.templateName, statement.lineNumber);
      }
      else if (Reference.check(token)) {
        this.describer = new Reference(token, this.templateName, statement.lineNumber);
      } 
      else {
        throw new ComponentSyntaxError(
          `Invalid log statement value provided in '${this.templateName}' at line number ${statement.lineNumber}`
        );
      }
    } 
    else {
      const token = tokens.shift() as string;

      if (Tool.check(token)) {
        const $arguments = TokenParser.parseArguments(tokens, this.templateName, statement.lineNumber);
        const tool = $arguments ? token.concat('(' , ...$arguments, ')') : token.concat('()');
        this.describer = new Tool(tool, this.templateName, statement.lineNumber);
      } 
      else {
        throw new ComponentSyntaxError(
          `Invalid log statement value provided in '${this.templateName}' at line number ${statement.lineNumber}`
        );
      }
    }
  }
}
