import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';

/* prettier-ignore */
export class Local {
  public lineNumber: number;

  public templateName: string;

  public path?: string;

  public name: string;

  constructor(local: string, templateName:string, lineNumber:number) {

    this.lineNumber = lineNumber;
    this.templateName = templateName;

    const regex = /^\$locals\.(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/;
    const match = regex.exec(local);
    
    if (match?.groups?.path) this.path = match.groups.path;
    if(match?.groups?.name) this.name = match.groups.name;
    else throw new ComponentSyntaxError(`Invalid local in '${templateName}' at line number ${lineNumber}`);
  }

  public static check(value: string): boolean {
    return /^\$locals\.(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/.test(
      value
    );
  }

}
