import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement } from '../parsers/TemplateParser';

/* prettier-ignore */
export class Place {

  name: string;

  constructor(statement: Statement) {
    const regex = /^\$place[\s\n]*\([\s\n]*(?<name>[a-zA-Z_\$][a-zA-Z0-9_\$]*)[\s\n]*\)$/;
    const match = regex.exec(statement.definition);

    if(!match?.groups?.name) {
      throw new ComponentSyntaxError(
        `Missing or Invalid place statement name in '${statement.templateName}' at line number ${statement.lineNumber}`
      )
    }

    this.name = match.groups.name;
  }
}
