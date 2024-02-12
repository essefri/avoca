import { Condition } from '../describers/Condition';
import { ComponentParserError } from '../../../errors/regex/ComponentParserError';
import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { Statement, TemplateParser } from '../parsers/TemplateParser';

type TagPosition = {
  tag: '$if' | '$elseif' | '$else' | '$endif';
  index: number;
};

type BlockType = 'if' | 'elseif' | 'else';

type ConditionBlock = {
  type: BlockType;
  content: string;
  line: number;
};

type ConditionBlocks = {
  ifBlock: ConditionBlock;
  elseIfBlocks: ConditionBlock[] | null;
  elseBlock: ConditionBlock | null;
};

export type Block = {
  condition?: Condition;
  body: string;
  statements: Statement[] | null;
  line: number;
};

/* prettier-ignore */
export class If extends TemplateParser {

  public placeholder: string;

  public ifBlock: Block;

  public elseIfBlocks?: Block[];

  public elseBlock?: Block; 

  constructor(statement: Statement) {
    super(statement.templateName);

    this.placeholder = statement.placeholder;

    const template = statement.definition;
    const line = statement.lineNumber;
    const conditionBlocks = this.parseConditionBlocks(template, line);

    this.ifBlock = this.describeIf(conditionBlocks.ifBlock);

    if(conditionBlocks.elseIfBlocks) {
      this.elseIfBlocks = [];
      conditionBlocks.elseIfBlocks.forEach(elseIfBlock => {
        this.elseIfBlocks?.push(this.describeElseIf(elseIfBlock));
      });
    }

    if(conditionBlocks.elseBlock) {
      this.elseBlock = this.describeElse(conditionBlocks.elseBlock);
    }
  }

  makeConditionBlock(content:string, line:number, type:BlockType):ConditionBlock {
    return {content, line, type};
  }

  describeIf(ifBlock:ConditionBlock): Block {
    if (!ifBlock) throw new ComponentParserError('Invalid if statement structure');

    const $arguments = this.parseArguments(ifBlock.content, ifBlock.line, ifBlock.type as 'if');

    ifBlock.content = ifBlock.content.replace($arguments, 'condition');

    const regex = /^(?:\$if[\s\n]*\(condition\)(?<body>[\s\S]+))$/;
    const match = regex.exec(ifBlock.content);

    if (! match?.groups?.body) {
      throw new ComponentSyntaxError(
        `Missing if statement body in '${this.templateName}' at line number ${ifBlock.line}`
      )
    }

    if (match?.groups?.body.trim().length === 0) {
      throw new ComponentSyntaxError(
        `Missing if statement body in '${this.templateName}' at line number ${ifBlock.line}`
      )
    }
        
    const template = this.parseTemplate(match.groups.body, false, ifBlock.line);

    return { 
      condition:new Condition($arguments, this.templateName, ifBlock.line), 
      body: template.layout, 
      statements:template.statements,
      line: ifBlock.line
    };
  }

  describeElseIf(block: ConditionBlock):Block {
    const $arguments = this.parseArguments(block.content,block.line,block.type as 'elseif');
    block.content = block.content.replace($arguments,'condition');

    const regex = /^(?:\$elseif[\s\n]*\(condition\)(?<body>[\s\S]+))$/;
    const match = regex.exec(block.content);

    if (! match?.groups?.body) {
      throw new ComponentSyntaxError(
        `Missing elseif statement body in ''${this.templateName}'' at line number ${block.line}`
      )
    }
      
    if (match?.groups?.body.trim().length === 0) {
      throw new ComponentSyntaxError(
        `Missing elseif statement body in ''${this.templateName}'' at line number ${block.line}`
      )
    }

    const template = this.parseTemplate(match.groups.body, false, block.line);

    return { 
      condition:  new Condition($arguments, this.templateName, block.line), 
      body: template.layout,
      statements: template.statements,
      line: block.line
    };
  }

  describeElse(block: ConditionBlock) {
    const regex = /^(?:\$else(?<body>[\s\S]+))$/;
    const match = regex.exec(block.content);

    if (! match?.groups?.body) {
      throw new ComponentSyntaxError(`Missing else statement body in '${this.templateName}' at line number ${block.line}`)
    }

    if (match?.groups?.body.trim().length === 0) {
      throw new ComponentSyntaxError(`Missing else statement body in '${this.templateName}' at line number ${block.line}`)
    }
    
    const template = this.parseTemplate(match.groups.body, false, block.line);

    return { 
      body: template.layout,
      statements: template.statements,
      line: block.line
    };
  }


  parseConditionBlocks(template:string , parentLine:number): ConditionBlocks {
    const regex = /\$if|\$elseif|\$else|\$endif/g;
    const conditionBlocks:ConditionBlocks = {
      ifBlock: this.makeConditionBlock('' , 0 , 'if'),
      elseIfBlocks: null,
      elseBlock: null,
    };

    let level = 0;
    let match: RegExpExecArray | null;
    let PrevBlock: TagPosition[] = [];

    while ((match = regex.exec(template)) !== null) {
      const tag = match[0];
      const index = match.index;

      if (PrevBlock.length > 0 && tag === '$if') level ++;
      else if (level > 0 && tag === '$endif') level --;
      else if (level === 0) {
        if (tag === '$if') {
          if (PrevBlock.length === 0) PrevBlock.push({ tag, index });          
          else {
            throw new ComponentSyntaxError(
              `Unexpected '$if' tag in '${this.templateName}' at line number ${
                this.getLineNumber(template, index, parentLine)
              } `
            );
          }
        } 
        else if (tag === '$elseif' || tag ==='$else') {
          const previousBlock: TagPosition | undefined = PrevBlock.pop();
          const currentBlock: TagPosition = { tag, index };
  
          if (previousBlock?.tag === '$if' || previousBlock?.tag === '$elseif') {
            const content = template.slice(previousBlock.index,currentBlock.index);
            if (previousBlock.tag === '$if') {
              conditionBlocks.ifBlock = this.makeConditionBlock(
                content,
                this.getLineNumber(template, previousBlock.index, parentLine),
                'if'
              );
            } 
            else {
              if (!conditionBlocks.elseIfBlocks) conditionBlocks.elseIfBlocks = [];
              conditionBlocks.elseIfBlocks.push(this.makeConditionBlock(
                content,
                this.getLineNumber(template, previousBlock.index, parentLine),
                'elseif'
              ));
            }
            PrevBlock.push(currentBlock);
          } 
          else {
            throw new ComponentSyntaxError(
              `Unexpected '${tag}' tag in '${this.templateName}' at line number ${
                this.getLineNumber(template, index, parentLine)
              } `
            );
          }
        } else if (tag === '$endif') {
          const previousBlock: TagPosition | undefined = PrevBlock.pop();
          const currentBlock: TagPosition = { tag, index };
  
          if (previousBlock) {
            const content = template.slice(previousBlock.index,currentBlock.index);
  
            if (previousBlock.tag === '$if') {
              conditionBlocks.ifBlock = this.makeConditionBlock(
                content,
                this.getLineNumber(template, previousBlock.index, parentLine),
                'if'
              );
            } 
            else if (previousBlock.tag === '$elseif') {
              if (!conditionBlocks.elseIfBlocks) conditionBlocks.elseIfBlocks = [];
              conditionBlocks.elseIfBlocks.push(this.makeConditionBlock(
                content,
                this.getLineNumber(template, previousBlock.index, parentLine),
                'elseif'
              ));
            } 
            else {
              conditionBlocks.elseBlock = this.makeConditionBlock(
                content,
                this.getLineNumber(template, previousBlock.index, parentLine),
                'else'
              )
            }
          } 
          else {
            throw new ComponentSyntaxError(
              `Unexpected '$endif' tag in '${this.templateName}' at line number ${
                this.getLineNumber(template, index, parentLine)
              } `
            );
          }
        }
      }
    }

    if (PrevBlock.length > 0) {
      const block = PrevBlock.pop() as TagPosition;
      throw new ComponentParserError(
        `Unexpected '${block.tag}' tag in '${this.templateName}' at line number ${
          this.getLineNumber(template,block.index, parentLine)
        }`
      );
    }

    return conditionBlocks;
  }
}
