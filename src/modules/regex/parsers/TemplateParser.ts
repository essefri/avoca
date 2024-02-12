import { randomUUID } from 'crypto';
import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { LineCounter } from './LineCounter';

type TagPosition = {
  sign: '$if' | '$include' | '$foreach' | '$render' | '$print';
  index: number;
};

/* prettier-ignore */
export type StatementType = 'if' | 'elseif' | 'include' | 'foreach' | 'render' | 'print' | 'place' | 'log';

export type Statement = {
  placeholder: string;
  definition: string;
  type: StatementType;
  lineNumber: number;
  templateName: string;
};

export type Template = {
  layout: string;
  statements: Statement[] | null;
};

/* prettier-ignore */
export class TemplateParser extends LineCounter {

  /**
   * Constructs a new instance of TemlateParser
   * @param templateName The template name
   */
  constructor(public templateName: string) { 
    super()
  }

  /**
   * Constructs a new Statement literal object
   * @param template The statement template
   * @param type The statement type
   * @param line The statement line number
   * @param name The statement name
   * @returns New Statement literal
   */
  private makeStatement(definition:string, lineNumber: number, type: StatementType):Statement {
    return {
      definition, placeholder: '', type, lineNumber, templateName: this.templateName
    }
  }

  /**
   * Parses and extracts arguments out of the given statement
   * @param statement The statement string
   * @param line The line number of the statement in the template
   * @param type The type of the statement
   * @returns The arguments exctracted out of the given statement
   */
  protected parseArguments(statement: string, lineNumber: number, type: StatementType): string {
    const regex = new RegExp(`\\$${type}[\\s\\n]*\\(`);
    const match = regex.exec(statement);

    if (match && match.index === 0) {
      const regex = /[()]/g;
      const parentheses: number[] = [];

      let match = null;

      while ((match = regex.exec(statement)) !== null) {
        if (match[0] === '(') parentheses.push(match.index);
        else if (match[0] === ')') {
          if (parentheses.length === 0) {
            throw new ComponentSyntaxError(
              `Unexpected closing parentheses found in '${this.templateName}' at line number ${
                this.getLineNumber(statement, match.index, lineNumber)
              }`
            );
          }

          const index = parentheses.pop();
          if (index !== undefined && parentheses.length === 0) {
            return statement.slice(index + 1, match.index);
          }
        }
      }

      if (parentheses.length > 0) {
        const index = parentheses.pop() as number;
        throw new ComponentSyntaxError(
          `Unexpected opening parentheses found in '${this.templateName}' at line number ${
            this.getLineNumber(statement, index, lineNumber)
          }`
        );
      }
    }

    throw new ComponentSyntaxError(
      `Invalid statement structure in '${this.templateName}' at line number ${lineNumber}`
    );
  }

  /**
   * Parses and extracts Statements defined in the given template
   * @param template The template string to parse
   * @param place Tells if you want to extract place statements as well or not
   * @param parentLine The parent line number in the case of nested templates
   * @returns Array of statements or null in case no statements have been defined
   */
  protected parseStatements(template: string, place: boolean = false, parentLine: number = 1): Statement[] | null {
    const regex = /\$if|\$endif|\$foreach|\$endforeach|\$render|\$endrender|\$include|\$print|\$log|\$place|\$replace/g;
    const openingTags: TagPosition[] = [];

    let match: RegExpExecArray | null;
    let statements: Statement[] = [];

    while ((match = regex.exec(template)) !== null) {
      const tag = match[0];
      const index = match.index;

      if (tag === '$if') openingTags.push({ sign: '$if', index });
      else if (tag === '$foreach') openingTags.push({ sign: '$foreach', index });
      else if (tag === '$render') openingTags.push({ sign: '$render', index });
      else if (tag === '$endif') {
        // calculate the statement ending position
        match.index = match.index + match[0].length;

        const openingTag = openingTags.pop();
        const closingTag = match;

        if (openingTag?.sign === '$if') {
          if (openingTags.length === 0) {
            const definition = template.slice(openingTag.index, closingTag.index);
            const line = this.getLineNumber(template, openingTag.index, parentLine);
            const statement = this.makeStatement(definition, line, 'if');
            statements.push(statement)
          }
        } 
        else {
          throw new ComponentSyntaxError(
            `Unexpected $endif tag in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, parentLine)
            }`
          );
        }
      } 
      else if (tag === '$endforeach') {
        // calculate the statement ending position
        match.index = match.index + match[0].length;

        const openingTag = openingTags.pop();
        const closingTag = match;

        if (openingTag?.sign === '$foreach') {
          if (openingTags.length === 0) {
            const definition = template.slice(openingTag.index, closingTag.index);
            const line = this.getLineNumber(template, openingTag.index, parentLine);
            const statement = this.makeStatement(definition, line, 'foreach');
            statements.push(statement)
          }
        } 
        else {
          throw new ComponentSyntaxError(
            `Unexpected $endforeach tag in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, parentLine)
            }`
          );
        }
      } 
      else if (tag === '$endrender') {
        // calculate the statement ending position
        match.index = match.index + match[0].length;

        const openingTag = openingTags.pop();
        const closingTag = match;

        if (openingTag?.sign === '$render') {
          if (openingTags.length === 0) {
            const definition = template.slice(openingTag.index, closingTag.index);
            const line = this.getLineNumber(template, openingTag.index, parentLine);
            const statement = this.makeStatement(definition, line, 'render');
            statements.push(statement)
          }
        } 
        else {
          throw new ComponentSyntaxError(
            `Unexpected $endrender tag in '${this.templateName}' at line number ${
              this.getLineNumber(template, openingTag!.index, parentLine)
            }`
          );
        }
      } 
      else if (tag === '$include' && openingTags.length === 0) {
        const line = this.getLineNumber(template, index, parentLine);
        const $arguments = this.parseArguments(template.slice(index), line, 'include');
        const definition = `$include(${$arguments})`;
        const statement = this.makeStatement(definition, line, 'include')
        statements.push(statement);
      } 
      else if (tag === '$print' && openingTags.length === 0) {
        const line = this.getLineNumber(template, index, parentLine);
        const $arguments = this.parseArguments(template.slice(index), line, 'print');
        const definition = `$print(${$arguments})`;
        const statement = this.makeStatement(definition, line, 'print')
        statements.push(statement);
      } 
      else if (tag === '$log' && openingTags.length === 0) {
        const line = this.getLineNumber(template, index, parentLine);
        const $arguments = this.parseArguments(template.slice(index), line, 'log');
        const definition = `$log(${$arguments})`;
        const statement = this.makeStatement(definition, line, 'log')
        statements.push(statement);
      } 
      else if (tag === '$place') {
        if (!place) {
          throw new ComponentSyntaxError(
            `Unexpected $place tag in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, parentLine)
            }`
          );
        } 
        else if (openingTags.length === 0) {
          const line = this.getLineNumber(template, index, parentLine);
          const $arguments = this.parseArguments(template.slice(index), line, 'place');
          const definition = `$place(${$arguments})`;
          const statement = this.makeStatement(definition, line, 'place')
          statements.push(statement);
        }
      } 
      else if (tag === '$replace') {
        const previousTag = openingTags.pop() as TagPosition;

        if (!previousTag || previousTag.sign !== '$render') {
          throw new ComponentSyntaxError(
            `Unexpected $replace tag in '${this.templateName}' at line number ${
              this.getLineNumber(template, index, parentLine)
            }`
          );
        }

        openingTags.push(previousTag);
      }
    }

    if (openingTags.length > 0) {
      const openingTag = openingTags.pop() as TagPosition;
      throw new ComponentSyntaxError(
        `Invalid ${openingTag.sign.slice(1)} statement structure in '${this.templateName}' at line number ${
          this.getLineNumber(template, openingTag.index, parentLine)
        }`
      );
    }

    return statements.length > 0 ? statements : null;
  }

  /**
   * Parses and Represents the given template string
   * @param template The template to parse and represent
   * @param place Tells if you want to extract place statements as well
   * @param parentLine The parent statement line number in the case of nested statements templates!
   * @returns Template object representing the given template
   */
  public parseTemplate(template: string, place: boolean = false, parentLine: number = 1): Template {
    const statements = this.parseStatements(template, place, parentLine);

    const $template: Template = {
      layout: template,
      statements: null,
    };

    if (!statements) return $template;

    $template.statements = statements;

    statements.forEach((statement) => {
      statement.placeholder = `{{ ${statement.type}: ${randomUUID()} }}`;
      $template.layout = $template.layout.replace(
        statement.definition,
        statement.placeholder
      );
    });

    return $template;
  }
}
