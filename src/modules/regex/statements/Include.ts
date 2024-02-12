import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement, TemplateParser } from '../parsers/TemplateParser';
import { isDotNotationExp } from '../../modules/Check';

/* prettier-ignore */
export class Include extends TemplateParser {

  path: string;

  constructor(statement: Statement) {

    super(statement.templateName);

    const path = this.parseArguments(statement.definition , statement.lineNumber , statement.type);

    // path must be a dot notation expression
    if(!isDotNotationExp(path)) {
      throw new ComponentSyntaxError(
        `Missing or Invalid include statement path in '${statement.templateName}' at line number ${statement.lineNumber}`
      )
    } 
    
    this.path = path
  }
}
