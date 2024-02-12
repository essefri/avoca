import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement, TemplateParser } from '../parsers/TemplateParser';
import { TokenParser } from '../parsers/TokenParser';
import { Reference } from '../describers/Reference';
import { Scalar } from '../describers/Scalar';
import { Local } from '../describers/Local';
import { Global } from '../describers/Global';
import { Tool } from '../describers/Tool';

export type RenderLocal = {
  key: string;
  value: Scalar | Local | Global | Tool | Reference;
};

type RenderReplacement = {
  name: string;
  body: string;
  statements: Statement[] | null;
};

/* prettier-ignore */
export class Render extends TemplateParser {
  public placeholder: string;

  public path: string;

  public locals: RenderLocal[] | null = null;

  public replacements: RenderReplacement[] | null = null;

  constructor(statement: Statement) {
    super(statement.templateName);

    this.placeholder = statement.placeholder;

    const $arguments = this.parseArguments(statement.definition, statement.lineNumber, 'render');

    const regex = /^(?:(?<path>[a-zA-Z_\$][a-zA-Z0-9_\$]*(?:\.[a-zA-Z_\$][a-zA-Z0-9_\$]*)*)[\s\n]*(?<locals>,[\s\S]*)?)$/;
    const match = regex.exec($arguments);
    
    if(!match?.groups?.path) {
      throw new ComponentSyntaxError(
        `Missing or Invalid template path in '${this.templateName}' at line number ${statement.lineNumber}`
      )
    } 

    this.path = match.groups.path;
    this.replacements = this.parseReplacements(statement.definition, statement.lineNumber);

    if(match.groups.locals) {
      this.locals = this.parseLocals(match.groups.locals, statement.lineNumber);
    }
  }

  parseLocals(template: string, lineNumber: number): RenderLocal[] | null {
   
    const tokens = TokenParser.parseTokens(template, /([(),])/g);
    const locals: RenderLocal[] = [];
    const structure: (',' | 'local')[] = [];

    while (tokens.length > 0) {
      const token = tokens.shift() as string;

      if (token === ',') structure.push(',');
      else {
        const regex = /^(?:(?<key>[a-zA-Z_\$][a-zA-Z_\$]*)[\s\n]*=[\s\n]*(?<value>[\s\S]*))$/;
        const match = regex.exec(token);

        if (match?.groups?.key && match?.groups?.value) {
          if (Scalar.check(match.groups.value)) {
            structure.push('local');
            locals.push({
              key: match.groups.key,
              value: new Scalar(match.groups.value, this.templateName, lineNumber)
            });
          } 
          else if (Local.check (match.groups.value)) {
            structure.push('local');
            locals.push({
              key: match.groups.key,
              value: new Local(match.groups.value, this.templateName, lineNumber)
            });
          } 
          else if (Tool.check(match.groups.value)) {
            const $arguments = TokenParser.parseArguments(tokens, this.templateName , lineNumber);
            const pattern = $arguments ? match.groups.value.concat('(', ...$arguments, ')') : match.groups.value.concat('()');
            structure.push('local');
            locals.push({
              key: match.groups.key,
              value: new Tool(pattern, this.templateName, lineNumber)
            });
          }
          else if (Reference.check(match.groups.value)) {
            structure.push('local');
            locals.push({
              key: match.groups.key,
              value: new Reference(match.groups.value, this.templateName, lineNumber)
            });
          }
          else {
            throw new ComponentSyntaxError(
              `Invalid local value provided in '${this.templateName}' at line number ${lineNumber}`
            );
          }
        } else {
          throw new ComponentSyntaxError(
            `Invalid local key value paires provided in '${this.templateName}' at line number ${lineNumber}`
          );
        }
      }
    }

    if(/^(?:(,[\s\n]*local[\s\n]*)+)$/.test(structure.join(''))) return locals;

    throw new ComponentSyntaxError(
      `Invalid local key value paires provided in '${this.templateName}' at line number ${lineNumber}`
    );

  }

  parseReplacements(template: string, line: number): RenderReplacement[] | null {
    const replacements: RenderReplacement[] = [];
    const regex = /\$replace|\$endreplace/g;

    let openingTags: number[] = [];
    let match = null;

    while ((match = regex.exec(template)) !== null) {
      const tag = match[0];
      const index = match.index;

      if (tag === '$replace') {
        if (openingTags.length > 0) {
          throw new ComponentSyntaxError(
            `Unexpected $replace tag found in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, line)
            }`
          );
        }
        openingTags.push(index);
      } else if (tag === '$endreplace') {
        const openingTag = openingTags.pop() as number;

        if (openingTag && openingTags.length === 0) {
          const replace = template.slice(openingTag, index + '$endreplace'.length);
          replacements.push(
            this.describeReplacement(
              replace,
              this.getLineNumber(template, openingTag, line)
            )
          );
        } 
        else {
          throw new ComponentSyntaxError(
            `Unexpected $endreplace tag found in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, line)
            }`
          );
        }
      }
    }

    if (openingTags.length > 0) {
      const openingTag = openingTags.pop() as number;
      throw new ComponentSyntaxError(
        `Unexpected $replace tag found in ''${this.templateName}'' at line number ${
          this.getLineNumber(template, openingTag, line)
        }`
      );
    }

    return replacements.length > 0 ? replacements : null;
  }

  describeReplacement(replacmenet: string, lineNumber: number): RenderReplacement {
    const regex = /^(?:\$replace[\s\n]*\([\s\n]*(?<name>[a-zA-Z_\$][a-zA-Z0-9_\$]*)[\s\n]*\)(?<body>[\s\S]*)\$endreplace)$/;
    const match = regex.exec(replacmenet);

    if (!match?.groups?.name) {
      throw new ComponentSyntaxError(
        `Missing replace name in '${this.templateName}' at line number ${lineNumber}`
      );
    }

    if (!match?.groups?.body) {
      throw new ComponentSyntaxError(
        `Missing replace body in '${this.templateName}' at line number ${lineNumber}`
      );
    }

    if (match.groups.body.trim().length === 0) {
      throw new ComponentSyntaxError(
        `Missing replace body in '${this.templateName}' at line number ${lineNumber}`
      );
    }

    const template = this.parseTemplate(match.groups.body, false, lineNumber);

    return {
      name: match.groups.name,
      body: template.layout,
      statements: template.statements
    };
  }

}
