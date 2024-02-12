import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { TokenParser } from '../parsers/TokenParser';
import { Scalar } from './Scalar';
import { Reference } from './Reference';
import { Local } from './Local';
import { Global } from './Global';

/* prettier-ignore */
type ToolArgument = Tool | Global | Local | Scalar | Reference;

/* prettier-ignore */
type ArgumentStructure = ( 'action' | 'tool' | 'local' | 'global' | 'scalar' | 'reference' | ',')[];

/* prettier-ignore */
export class Tool {

  public lineNumber: number;

  public templateName: string;

  public name: string;

  private arguments: ToolArgument[] | null = null;

  constructor(pattern: string, templateName: string, lineNumber: number){

    this.templateName = templateName;
    this.lineNumber = lineNumber;

    const tokens = TokenParser.parseTokens(pattern, /([(),])/g);
    const token = tokens.shift() as string;
    
    if (!Tool.check(token)) {
      throw new ComponentSyntaxError(
        `Unexpected token found in ${templateName} at line number ${lineNumber}`
      );
    }

    this.name = this.parseName(token);
    this.arguments = this.process(
      TokenParser.parseArguments(tokens , templateName , lineNumber)
    );
    
  }

  public static check(pattern: string): boolean {
    return /^\$tools(?<name>(?:\.[a-zA-Z_\$][a-zA-Z0-9_\$]*)|(?:\['[^\']+\'\]|\["[^\"]+"\]|\[[0-9]+\])){1}$/.test(
      pattern
    );
  }

  public hasArguments():boolean {
    return Array.isArray(this.arguments) && this.arguments.length > 0;
  }

  public getArguments(): ToolArgument[] | null {
    return this.arguments;
  }
  
  private parseName(pattern: string): string {
    const regex = /^\$tools(?:\.(?<name>[a-zA-Z_\$][a-zA-Z0-9_\$]*)){1}$/;
    const match = regex.exec(pattern);

    if (match?.groups?.name) return match.groups.name;

    throw new ComponentSyntaxError(
      `Missing or Invalid tool name in ${this.templateName} at line number ${this.lineNumber}`
    );
  }

  private process(tokens: string[] | null): ToolArgument[] | null {
    if (!tokens) return null;

    const result: ToolArgument[] = [];
    const structure: ArgumentStructure = [];

    while (tokens.length > 0) {
      const token = tokens.shift() as string;

      if (token === ',') structure.push(','); 
      else if (Tool.check(token)) {
        const $arguments = TokenParser.parseArguments(tokens , this.templateName , this.lineNumber);
        const pattern = $arguments ? token.concat('(' , ...$arguments ,')') : token.concat('()');
        result.push(new Tool(pattern, this.templateName, this.lineNumber));
        structure.push('action');
      }
      else if (Local.check(token)) {
        result.push(new Local(token, this.templateName, this.lineNumber));
        structure.push('local');
      }
      else if (Global.check(token)) {
        result.push(new Global(token, this.templateName, this.lineNumber));
        structure.push('global');
      }
      else if (Scalar.check(token)) {
        result.push(new Scalar(token, this.templateName, this.lineNumber));
        structure.push('scalar');
      } 
      else if (Reference.check(token)) {
        result.push(new Reference(token, this.templateName, this.lineNumber));
        structure.push('reference');
      } 
      else {
        throw new ComponentSyntaxError(
          `Invalid tool arguments provided in ${this.templateName} at line number ${this.lineNumber}`
        );
      }
    }

    if (!/^(?:,?action|,?tool|,?local|,?global|,?scalar|,?reference)+$/.test(structure.join(''))) {
      throw new ComponentSyntaxError(
        `Invalid tool arguments provided in ${this.templateName} at line number ${this.lineNumber}`
      );
    }

    return result;
  }
}
