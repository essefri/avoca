import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';

/* prettier-ignore */
export class Reference {
  public lineNumber:number;
  
  public templateName: string;

  public path: string;

  public name: string;

  constructor(reference: string, templateName:string, lineNumber:number) {

    this.lineNumber = lineNumber;
    this.templateName = templateName;

    const regex = /^(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/;
    const match = regex.exec(reference);

    if (match?.groups?.path) this.path = match.groups.path;
    if (match?.groups?.name) this.name = match.groups.name;
    else throw new ComponentSyntaxError(`Invalid reference in '${templateName}' at line number ${lineNumber}`);
  }

  public static check(value: string): boolean {
    return /^(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/.test(
      value
    );
  }
}
