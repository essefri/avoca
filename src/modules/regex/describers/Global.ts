import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';

/* prettier-ignore */
export class Global {
  public lineNumber:number;

  public templateName:string;
  
  public path: string | undefined;
  
  public name: string;

  constructor(global: string, templateName:string, lineNumber:number) {

    this.templateName = templateName;
    this.lineNumber = lineNumber;

    const regex = /^\$globals\.(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/;
    const match = regex.exec(global);
    
    if (match?.groups?.path) this.path = match.groups.path;
    if(match?.groups?.name) this.name = match.groups.name;
    else throw new ComponentSyntaxError(`Invalid global in '${templateName}' at line number ${lineNumber}`);
  }

  public static check(value: string): boolean {
    return /^\$globals\.(?<name>[a-zA-Z_$][a-zA-Z0-9_$]*)(?<path>(\[[0-9]+\]|\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)?$/.test(
      value
    );
  }

}
