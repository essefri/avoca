import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { TokenParser } from '../parsers/TokenParser';
import { Global } from './Global';
import { Local } from './Local';
import { Reference } from './Reference';
import { Scalar } from './Scalar';
import { Tool } from './Tool';

type Comparison = {
  type: 'comparison';
  sign: '===' | '==' | '!==' | '!=' | '>=' | '<=' | '<' | '>';
};

type Logical = {
  type: 'logical';
  sign: '&&' | '||';
};

type Not = {
  type: 'not';
  sign: '!';
};

type Operator = Not | Logical | Comparison;

export type Operand = {
  type: 'operand';
  hasParen: boolean;
  value: Global | Local | Tool | Scalar | Reference;
};

export type Unary = {
  type: 'unary';
  hasParen: boolean;
  operator: Operator;
  operand: Operand | Binary;
};

export type Binary = {
  type: 'binary';
  hasParen: boolean;
  operator: Operator;
  left: Binary | Unary | Operand;
  right: Binary | Unary | Operand;
};

type Structure = {
  left: string[];
  right: string[];
  operator: string;
};

/* prettier-ignore */
export class Condition {

  public lineNumber: number;

  public templateName: string;

  public description: Binary|Unary|Operand;

  constructor(pattern: string, templateName: string, lineNumber: number) {

    this.lineNumber = lineNumber;
    this.templateName = templateName;

    const regex = /([()]|={2,3}|[|&]{2}|[><!]={0,2})/g;
    const tokens = TokenParser.parseTokens(pattern, regex);

    this.description = this.proccessTokens(tokens, false);
  }

  public isBinary(description: Unary | Binary | Operand): description is Binary {
    return (description as Binary).left !== undefined;
  }

  public isUnary(description: Unary | Binary | Operand): description is Unary {
    return (description as Unary).operand !== undefined;
  }

  private isLogicalOperator(pattern: string): boolean {
    const operators = ['||', '&&'];
    return operators.includes(pattern);
  }

  private isComparisonOperator(pattern: string): boolean {
    const operators = ['===', '==', '!==', '!=', '<=', '>=', '<', '>'];
    return operators.includes(pattern);
  }

  private isNotOperator(pattern: string): boolean {
    return pattern === '!';
  }

  private parseStructure(tokens: string[]): Structure | null {

    const validators = [this.isLogicalOperator, this.isComparisonOperator];

    let level = 0;

    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];

      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];

        if (token === '(') level++;
        else if (token === ')') level--;

        if (level === 0 && validator(token)) {
          return {
            left: tokens.slice(0, index),
            right: tokens.slice(index + 1),
            operator: tokens[index],
          };
        }
      }
    }

    if (level !== 0) {
      throw new ComponentSyntaxError(
        `Unexpected parentheses in ${this.templateName} at line number ${this.lineNumber}`
      );
    }

    return null;
  }

  private prccessOperator(token: string): Operator {
    if (this.isComparisonOperator(token)) {
      return { type: 'comparison', sign: token } as Comparison;
    } 
    if (this.isLogicalOperator(token)) {
      return { type: 'logical', sign: token } as Logical;
    } 
    if (this.isNotOperator(token)) {
      return { type: 'not', sign: token } as Not;
    } 
    throw new ComponentSyntaxError(
      `Unexpected token '${token}' in ${this.templateName} at line number ${this.lineNumber}`
    );
  }

  private proccessTokens(tokens: string[], hasParen: boolean): Binary | Unary | Operand {

    const structure = this.parseStructure(tokens);
    
    if (structure) {
      const left = this.proccessTokens(structure.left, false);
      const right = this.proccessTokens(structure.right, false);
      const operator = this.prccessOperator(structure.operator);

      return { type: 'binary', hasParen, operator, left, right } as Binary;
    }

    const token = tokens.shift() as string;
    
    if(token) {
      if(tokens.length === 0) {
        if (Scalar.check(token)) {
          return {
            hasParen, 
            type: 'operand', 
            value: new Scalar(token, this.templateName, this.lineNumber)
          };
        }
        if (Global.check(token)) {
          return {
            hasParen, 
            type: 'operand', 
            value: new Global(token, this.templateName, this.lineNumber)
          };
        }
        if (Local.check(token)) {
          return {
            hasParen, 
            type: 'operand', 
            value: new Local(token, this.templateName, this.lineNumber)}

        }
        if(Reference.check(token)) {
          return {
            hasParen, 
            type: 'operand', 
            value: new Reference(token, this.templateName, this.lineNumber)
          }
        }
      } else {
        if (token === '(') {
          tokens.unshift(token);
          return this.proccessTokens(
            TokenParser.parseArguments(tokens , this.templateName, this.lineNumber) as string[],
            true
          );
        }
        if (this.isNotOperator(token)) {
          return { 
            type: 'unary',
            hasParen,
            operator: this.prccessOperator(token), 
            operand: this.proccessTokens(tokens, false) 
          } as Unary;
        }
        if (Tool.check(token)) {
          const args = TokenParser.parseArguments(tokens , this.templateName, this.lineNumber);
          if (tokens.length === 0) {
            const pattern = args  ? token.concat('(', ...args, ')') : token.concat('()');
            return {
              hasParen, 
              type: 'operand', 
              value: new Tool(pattern, this.templateName, this.lineNumber)
            };
          }
        }
      }
    }

    throw new ComponentSyntaxError(
      `Invalid condition expression in ${this.templateName} at line number ${this.lineNumber}`
    );
  }
}
