import { Reference } from '../describers/Reference';
import { Local } from '../describers/Local';
import { Global } from '../describers/Global';
import { Tool } from '../describers/Tool';

import { TokenParser } from '../parsers/TokenParser';
import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { TemplateParser, Statement } from '../parsers/TemplateParser';

type Collection = Reference | Local | Global | Tool;

type ForEachArguments = {
  match: string;
  item: string;
  index: string | null;
  collection: Collection;
};

/* prettier-ignore */
export class ForEach extends TemplateParser {

  /**
   * @property The statement placeholder in the template
   * @note Placeholder is a UUID string replaces the statement definition in the template
   */
  public placeholder: string;

  /**
   * @property The line number of the statement in the template
   */
  public lineNumber: number;

  /**
   * @property The foreach statement item varibale name
   */
  public item: string;

  /**
   * @property The foreach statement index variable name (optional)
   */
  public index: string | null;

  /**
   * @property The foreach statement collection varibale name 
   */
  public collection: Collection;

  /**
   * @property The foreach statement body content
   */
  public body: string;

  /**
   * @property The foreach statement nested statements
   */
  public statements: Statement[] | null;


  /**
   * Constructs a new Foreach statement instance 
   * @param statement The foreach statement to represent
   */
  constructor(statement: Statement) {
    super(statement.templateName);
    
    this.placeholder = statement.placeholder;
    this.lineNumber = statement.lineNumber;

    const $arguments = this.parseForEachArguments(statement.definition, statement.lineNumber);

    this.collection = $arguments.collection;
    this.index = $arguments.index;
    this.item = $arguments.item;
    
    statement.definition = statement.definition.replace($arguments.match, 'arguments');

    const regex = /^(?:\$foreach[\s\n]*\(arguments\)(?<body>[\s\S]*)\$endforeach)$/;
    const match = regex.exec(statement.definition);

    if (!match?.groups?.body) {
      throw new ComponentSyntaxError(
        `Missing foreach statement body in '${this.templateName}' at line number ${statement.lineNumber}`
      );
    }

    if (match?.groups?.body.trim().length === 0) {
      throw new ComponentSyntaxError(
        `Missing foreach statement body in '${this.templateName}' at line number ${statement.lineNumber}`
      );
    }

    const template = this.parseTemplate(match.groups.body, false, statement.lineNumber);

    this.body = template.layout;
    this.statements = template.statements
  }

  /**
   * Parses and Extracts the arguments out of the given foreach statement template
   * @param template The foreach statement template
   * @param line The foreach statement line
   * @returns Object represents arguments defined in the given statement
   */
  parseForEachArguments(template: string, lineNumber: number): ForEachArguments {
    const regex = /^(?<item>[a-zA-Z_$][a-zA-Z0-9_$]*)[\s\n]*(?:,[\s\n]*(?<index>[a-zA-Z_$][a-zA-Z0-9_$]*))?[\s\n]*in[\s\n]*(?<collection>[\s\S]+)$/;
    const $arguments =  this.parseArguments(template, lineNumber, 'foreach');
    const match = regex.exec($arguments);

    if (match?.groups?.item && match?.groups?.collection) {
      return { 
        match: match[0],
        item: match.groups.item, 
        index: match.groups.index ? match.groups.index : null, 
        collection : this.describeCollection(match.groups.collection.trim(), lineNumber)
      };
    }

    throw new ComponentSyntaxError(
      `Missing or Invalid foreach statement arguments in '${this.templateName}' at line number ${lineNumber}`
    );
  }

  /**
   * Describes the given collection argument
   * @param collection The collection argument to describe
   * @param line The foreach statement line number
   * @returns Instance of a Describer based on the Collection type
   */
  describeCollection(collection:string , lineNumber:number):Collection {
    const tokens = TokenParser.parseTokens(collection, /([(),])/g);

    if (tokens.length === 1) {
      const token = tokens.shift() as string;

      if (Local.check(token)) {
        return new Local(collection, this.templateName, lineNumber);
      } 
      
      if (Global.check(token)) {
        return new Global(collection, this.templateName, lineNumber);
      } 

      if (Reference.check(token)) {
        return new Reference(collection, this.templateName, lineNumber);
      }

      throw new ComponentSyntaxError(
        `Missing or Invalid foreach statement collection in '${this.templateName}' at line number ${lineNumber}`
      );
    } 
    else if (tokens.length > 1) {
      const pattern = tokens.shift() as string;
      
      if (Tool.check(pattern)) {
        return new Tool(collection, this.templateName, lineNumber);
      }

      throw new ComponentSyntaxError(
        `Missing or Invalid foreach statement collection in '${this.templateName}' at line number ${lineNumber}`
      );
    }

    throw new ComponentSyntaxError(
      `Missing or Invalid foreach statement collection in '${this.templateName}' at line number ${lineNumber}`
    );
  }
}
