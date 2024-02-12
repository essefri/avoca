import { ComponentSyntaxError } from '../../../errors/regex/ComponentSyntaxError';
import { TemplateParser, Statement, StatementType } from './TemplateParser';

import { RenderLocal, Render } from '../statements/Render';
import { Block, If } from '../statements/If';
import { ForEach } from '../statements/ForEach';
import { Include } from '../statements/Include';
import { Place } from '../statements/Place';
import { Print } from '../statements/Print';
import { Log } from '../statements/Log';

import { Reference } from '../describers/Reference';
import { Condition } from '../describers/Condition';
import { Global } from '../describers/Global';
import { Local } from '../describers/Local';
import { Tool } from '../describers/Tool';
import { InternalError } from '../../../errors/regex/InternalError';
import { Scalar } from '../describers/Scalar';

export type Describer = Local | Global | Tool | Reference | Scalar;

export type ifNodeBlock = {
  lineNumber: number;
  body: string;
  nodes?: Node[];
  condition?: Condition;
};

export type IfNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  ifBlock: ifNodeBlock;
  elseIfBlocks?: ifNodeBlock[];
  elseBlock?: ifNodeBlock;
};

export type ForEachNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  item: string;
  collection: Tool | Global | Local | Reference;
  body: string;
  index?: string;
  nodes?: Node[];
};

export type ReplaceNode = {
  name: string;
  body: string;
  nodes?: Node[];
};

export type RenderNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  path: string;
  locals?: RenderLocal[];
  replaceNodes?: ReplaceNode[];
};

export type IncludeNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  path: string;
};

export type PrintNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  describer: Describer;
};

export type LogNode = {
  type: StatementType;
  lineNumber: number;
  describer: Describer;
};

export type PlaceNode = {
  type: StatementType;
  lineNumber: number;
  placeholder: string;
  name: string;
};

export type Node =
  | IfNode
  | ForEachNode
  | RenderNode
  | IncludeNode
  | PrintNode
  | LogNode
  | PlaceNode;

export class NodeParser extends TemplateParser {
  template: string;

  nodes: Node[];

  constructor(template: string, name: string) {
    super(name);

    this.template = template;

    this.deleteComments();

    const { layout, statements } = this.parseTemplate(this.template, true);

    this.template = layout;

    if (statements) {
      this.nodes = this.makeNodes(statements);
    }
  }

  makeNodes(statements: Statement[]): Node[] {
    const nodes: Node[] = [];

    statements.forEach((statement) => {
      switch (statement.type) {
        case 'if':
          nodes.push(this.makeIfNode(statement));
          break;
        case 'foreach':
          nodes.push(this.makeForEachNode(statement));
          break;
        case 'render':
          nodes.push(this.makeRenderNode(statement));
          break;
        case 'include':
          nodes.push(this.makeIncludeNode(statement));
          break;
        case 'print':
          nodes.push(this.makePrintNode(statement));
          break;
        case 'log':
          nodes.push(this.makeLogNode(statement));
          break;
        case 'place':
          nodes.push(this.makePlaceNode(statement));
          break;
        default:
          throw new InternalError('Unexpected node type');
      }
    });

    return nodes;
  }

  makeIfNodeBlock(block: Block): ifNodeBlock {
    const ifNodeBlock: ifNodeBlock = {
      lineNumber: block.line,
      body: block.body,
    };

    if (block.condition) ifNodeBlock.condition = block.condition;
    if (block.statements)
      ifNodeBlock.nodes = this.makeNodes(block.statements) as Node[];

    return ifNodeBlock;
  }

  makeIfNode(statement: Statement): IfNode {
    const instance = new If(statement);
    const ifBlock = this.makeIfNodeBlock(instance.ifBlock);

    const ifNode: IfNode = {
      lineNumber: statement.lineNumber,
      type: statement.type,
      placeholder: statement.placeholder,
      ifBlock,
    };

    if (instance.elseIfBlocks) {
      ifNode.elseIfBlocks = [];
      instance.elseIfBlocks.forEach((block) => {
        ifNode.elseIfBlocks?.push(this.makeIfNodeBlock(block));
      });
    }

    if (instance.elseBlock) {
      ifNode.elseBlock = this.makeIfNodeBlock(instance.elseBlock);
    }

    return ifNode;
  }

  makeForEachNode(statement: Statement): ForEachNode {
    const forEach = new ForEach(statement);

    const forEachNode: ForEachNode = {
      lineNumber: statement.lineNumber,
      type: statement.type,
      placeholder: statement.placeholder,
      item: forEach.item,
      collection: forEach.collection,
      body: forEach.body,
    };

    if (forEach.index) forEachNode.index = forEach.index;

    if (forEach.statements) {
      forEachNode.nodes = this.makeNodes(forEach.statements);
    }

    return forEachNode;
  }

  makeRenderNode(statement: Statement): RenderNode {
    const render = new Render(statement);

    const renderNode: RenderNode = {
      lineNumber: statement.lineNumber,
      type: statement.type,
      placeholder: statement.placeholder,
      path: render.path,
    };

    if (render.locals) renderNode.locals = render.locals;

    if (render.replacements) {
      renderNode.replaceNodes = [];

      render.replacements.forEach((replacement) => {
        const replaceNode: ReplaceNode = {
          name: replacement.name,
          body: replacement.body,
        };

        if (replacement.statements) {
          replaceNode.nodes = this.makeNodes(replacement.statements);
        }

        renderNode.replaceNodes?.push(replaceNode);
      });
    }

    return renderNode;
  }

  makePrintNode(statement: Statement): PrintNode {
    const print = new Print(statement);

    return {
      type: statement.type,
      lineNumber: statement.lineNumber,
      placeholder: statement.placeholder,
      describer: print.describer,
    };
  }

  makeLogNode(statement: Statement): LogNode {
    const log = new Log(statement);

    return {
      type: statement.type,
      lineNumber: statement.lineNumber,
      describer: log.describer,
    };
  }

  makeIncludeNode(statement: Statement): IncludeNode {
    const include = new Include(statement);
    return {
      type: statement.type,
      lineNumber: statement.lineNumber,
      placeholder: statement.placeholder,
      path: include.path,
    };
  }

  makePlaceNode(statement: Statement): PlaceNode {
    const place = new Place(statement);

    return {
      type: statement.type,
      lineNumber: statement.lineNumber,
      placeholder: statement.placeholder,
      name: place.name,
    };
  }

  parseComments(template: string): string[] | null {
    const regex = /\$comment|\$endcomment/g;
    const comments: string[] = [];

    let openingTags: number[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      const tag = match[0];
      const index = match.index;

      if (tag === '$comment') {
        if (openingTags.length > 0) {
          const lineNumber = this.getLineNumber(template, index);
          throw new ComponentSyntaxError(
            `Unexpected $comment tag found in ${this.templateName} at line number ${lineNumber}`
          );
        }
        openingTags.push(index);
      } else if (tag === '$endcomment') {
        const openingTagIndex = openingTags.pop();

        if (openingTagIndex) {
          const comment = template.slice(openingTagIndex, index);
          comments.push(comment);
        } else {
          const lineNumber = this.getLineNumber(template, index);
          throw new ComponentSyntaxError(
            `Unexpected $endcomment tag found in ${this.templateName} at line number ${lineNumber}`
          );
        }
      }
    }

    if (openingTags.length > 0) {
      const index = openingTags.pop() as number;
      const lineNumber = this.getLineNumber(template, index);
      throw new ComponentSyntaxError(
        `Unexpected $comment tag found in ${this.templateName} at line number ${lineNumber}`
      );
    }

    return comments.length > 0 ? comments : null;
  }

  deleteComments() {
    const comments = this.parseComments(this.template);
    if (comments) {
      comments.forEach((comment) => {
        let lines = 0;

        for (let index = 0; index < comment.length; index++) {
          const character = comment[index];
          if (character === '\n') lines++;
        }

        this.template = this.template.replace(comment, '\n'.repeat(lines));
      });
    }
  }
}
