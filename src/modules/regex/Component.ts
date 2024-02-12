import {
  ForEachNode,
  IfNode,
  IncludeNode,
  LogNode,
  PlaceNode,
  PrintNode,
  RenderNode,
} from './parsers/NodeParser';
import { NodeParser } from './parsers/NodeParser';
import { ComponentError } from '../../errors/regex/ComponentError';

import { readFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { resolve, sep } from 'path';

import { Scalar } from './describers/Scalar';
import { Local } from './describers/Local';
import { Global } from './describers/Global';
import { Tool } from './describers/Tool';
import { Reference } from './describers/Reference';

import { Node } from './parsers/NodeParser';

import {
  isArray,
  isDotNotationExp,
  isEmptyArray,
  isFunction,
  isNonEmptyArray,
  isObject,
  isObjectOwnProps,
  isText,
} from '../modules/Check';

import { GlobalStore } from './stores/GlobalStore';
import { ToolStore } from './stores/ToolStore';
import { LocalStore } from './stores/LocalStore';

import { ScopeStore } from './stores/ScopeStore';
import { Binary, Operand, Unary } from './describers/Condition';
import { InternalError } from '../../errors/regex/InternalError';
import { RegexConfiguration } from './config';

type Describer = Tool | Global | Local | Reference | Scalar;

type Expression = Unary | Binary | Operand;

export type ExecFunc = (...$arguments: any) => any;

export interface Execable {
  name: string;
  execute(...$arguments: any): any;
}

export type ReplaceArgument = {
  name: string;
  template: string;
};

export type LocalArgument<V> = {
  name: string;
  value: V;
};

export type GlobalArgument<V> = {
  name: string;
  value: V;
};

export type ActionArgument = Execable | ExecFunc;

export type ToolArgument = Execable | ExecFunc;

export class Component {
  static globals: GlobalStore = new GlobalStore();

  static tools: ToolStore = new ToolStore();

  static path: string;

  locals: LocalStore;

  scopes: ScopeStore;

  template: string;

  templateName: string;

  nodes: Node[];

  replacements: ReplaceArgument[];

  constructor(
    template: string,
    name: string,
    locals: LocalArgument<any>[] | null,
    replacements: ReplaceArgument[] | null
  ) {
    const parser = new NodeParser(template, name);

    this.template = parser.template;
    this.templateName = parser.templateName;
    this.nodes = parser.nodes;
    this.locals = new LocalStore();
    this.scopes = new ScopeStore();

    if (locals) this.setLocals(locals);
    if (replacements) this.setReplacements(replacements);
  }

  public static configure(configuration: RegexConfiguration) {
    if (isObject(configuration)) {
      if (isObjectOwnProps(configuration, ['path', 'globals', 'tools'])) {
        if (isText(configuration.path)) {
          Component.path = configuration.path;
        } else {
          throw new ComponentError(
            `Invalid template configuration path provided`
          );
        }

        if (isArray(configuration.globals)) {
          Component.setGlobals(configuration.globals);
        } else {
          throw new ComponentError(
            `Invalid template configuration globals provided`
          );
        }

        if (isArray(configuration.tools)) {
          Component.setTools(configuration.tools);
        } else {
          throw new ComponentError(`Invalid template configuration path tools`);
        }
      } else {
        throw new ComponentError(
          'Missing required template configuration options'
        );
      }
    } else {
      throw new ComponentError('Invalid template configuration provided');
    }
  }

  private static async fetchTemplateAsync(path: string): Promise<string> {
    if (!isDotNotationExp(path)) {
      throw new ComponentError(`Invalid template path provided '${path}'`);
    }

    const name = this.resolveTemplateName(path);
    path = path.replace('.', sep).concat('.kika');
    path = resolve(Component.path, path);

    try {
      return await readFile(path, { encoding: 'utf-8' });
    } catch (error) {
      throw new ComponentError(
        `Failed to read the content of the template '${name}'`
      );
    }
  }

  private static fetchTemplateSync(path: string): string {
    if (!isDotNotationExp(path)) {
      throw new ComponentError(`Invalid template path provided '${path}'`);
    }

    const name = this.resolveTemplateName(path);
    path = path.replace('.', sep).concat('.kika');
    path = resolve(Component.path, path);

    try {
      return readFileSync(path, 'utf-8');
    } catch (error) {
      throw new ComponentError(`Failed to read template content of '${name}'`);
    }
  }

  private static resolveTemplateName(path: string): string {
    const tokens = path.split('.');

    if (tokens.length === 0) {
      throw new ComponentError(`Failed to resolve template name from path`);
    }

    const name = tokens.pop() as string;
    if (/^[a-zA-Z_\$][a-zA-Z0-9_\$]*$/.test(name)) return name;

    throw new ComponentError(`Invalid template name '${name}'`);
  }

  private static resolveFileName(path: string): string {
    const tokens = path.split(sep);
    if (tokens.length < 1) {
      throw new ComponentError(
        `Failed to resolve template file name from path`
      );
    }

    const name = tokens.pop() as string;
    if (/^(?:[a-zA-Z_\$][a-zA-Z0-9_\$]*)\.kika$/.test(name)) return name;

    throw new ComponentError(`Invalid template file name '${name}'`);
  }

  public static render(
    path: string,
    locals: LocalArgument<any>[] | null,
    replacements: ReplaceArgument[] | null
  ): string {
    const template = Component.fetchTemplateSync(path);
    const name = Component.resolveTemplateName(path);
    const component = new Component(template, name, locals, replacements);

    if (component.nodes) {
      component.template = component.evalNodes(
        component.nodes,
        component.template
      );
    }

    return this.clean(component.template);
  }

  public static async renderAsync(
    path: string,
    locals: LocalArgument<any>[],
    replacements: ReplaceArgument[]
  ): Promise<string> {
    const template = await Component.fetchTemplateAsync(path);
    const name = Component.resolveTemplateName(path);
    const component = new Component(template, name, locals, replacements);

    if (component.nodes) {
      component.template = await component.evalNodesAsync(
        component.nodes,
        component.template
      );
    }

    return Component.clean(component.template);
  }

  public static setGlobals(globals: GlobalArgument<any>[]) {
    if (!(Component.globals instanceof GlobalStore)) {
      throw new ComponentError(
        'Component.globals property must be an instance of GlobalStore'
      );
    }

    globals.forEach((global) => {
      if (isObject(global)) {
        if (isText(global.name)) {
          return Component.globals.store(global.name, global.value);
        }
      }
      throw new ComponentError(`Invalid global argument provided`);
    });
  }

  public static setTools(tools: ToolArgument[]) {
    if (!(Component.tools instanceof ToolStore)) {
      throw new ComponentError(
        'Component.tools property must be an instance of ToolStore'
      );
    }

    tools.forEach((tool) => {
      if (isObject(tool) || isFunction(tool)) {
        Component.tools.store(tool);
      } else {
        throw new ComponentError(
          'The tool must be a function or a class instance implements the Execable interface'
        );
      }
    });
  }

  private setLocals(locals: LocalArgument<any>[]) {
    if (!(this.locals instanceof LocalStore)) {
      throw new ComponentError('locals must be an instance of LocalStore ');
    }

    locals.forEach((local) => {
      if (isObject(local)) {
        if (isText(local.name)) {
          return this.locals.store(local.name, local.value);
        }
      }
      throw new ComponentError(`Invalid local argument provided`);
    });
  }

  private setReplacements(replacements: ReplaceArgument[]) {
    this.replacements = replacements;
  }

  private evalArguments($arguments: Describer[]): any {
    const $args: any[] = [];

    for (let index = 0; index < $arguments.length; index++) {
      const $argument = $arguments[index];
      $args.push(this.evalArgument($argument));
    }

    return $args;
  }

  private evalArgument($argument: Describer): any {
    if ($argument instanceof Tool) {
      if ($argument.hasArguments()) {
        const $arguments = this.evalArguments(
          $argument.getArguments() as Describer[]
        );
        return Component.tools.exec($argument, $arguments);
      }
      return Component.tools.exec($argument);
    }

    if ($argument instanceof Global) {
      return Component.globals.resolve($argument);
    }

    if ($argument instanceof Local) {
      return this.locals.resolve($argument);
    }

    if ($argument instanceof Reference) {
      return this.scopes.read($argument);
    }

    if ($argument instanceof Scalar) {
      return $argument.value;
    }

    throw new InternalError('Unexpected Describer instance');
  }

  private sortExpressions(left: Expression, right: Expression): Expression[] {
    const leftParen = left.hasParen;
    const rightParen = right.hasParen;

    if (leftParen || (leftParen && rightParen) || !(leftParen || rightParen)) {
      return [left, right];
    } else return [right, left];
  }

  private evalCondition(condition: Expression): boolean {
    if (condition.type === 'binary') {
      const expressions = this.sortExpressions(condition.left, condition.right);
      const left = this.evalCondition(expressions[0]);
      const right = this.evalCondition(expressions[1]);

      if (condition.operator.type === 'comparison') {
        switch (condition.operator.sign) {
          case '===':
            return left === right;
          case '==':
            return left == right;
          case '!==':
            return left !== right;
          case '!=':
            return left != right;
          case '>=':
            return left >= right;
          case '<=':
            return left <= right;
          case '<':
            return left < right;
          case '>':
            return left > right;
          default:
            throw new InternalError(
              'Invalid condition comparison operator sign'
            );
        }
      } else if (condition.operator.type === 'logical') {
        switch (condition.operator.sign) {
          case '&&':
            return left && right;
          case '||':
            return left || right;
          default:
            throw new InternalError('Invalid condition logical operator sign');
        }
      } else {
        throw new InternalError('Invalid condition operator type');
      }
    } else if (condition.type === 'unary') {
      return !this.evalCondition(condition.operand);
    } else {
      return this.evalArgument(condition.value);
    }
  }

  private evalPlaceNode(node: PlaceNode) {
    if (!node && isNonEmptyArray(this.replacements)) {
      throw new ComponentError(
        `Unexpected replacement arguments passed to '${this.templateName}'`
      );
    }

    if (isEmptyArray(this.replacements) && node) {
      throw new ComponentError(
        `Unexpected place statements found in '${this.templateName}'`
      );
    }

    const replacement = this.replacements.find((replacement, index) => {
      if (replacement.name === node.name) {
        this.replacements = this.replacements.splice(index, 1);
        return true;
      }
      return false;
    });

    if (!replacement) {
      throw new ComponentError(
        `Unexpected place statement '${node.name}' at '${this.templateName}'`
      );
    }

    return replacement.template;
  }

  private evalNodes(nodes: Node[] | undefined, template: string): string {
    if (!nodes) return template;

    nodes.forEach((node) => {
      switch (node.type) {
        case 'if':
          template = template.replace(
            (node as IfNode).placeholder,
            this.evalIfNode(node as IfNode)
          );
          break;
        case 'foreach':
          template = template.replace(
            (node as ForEachNode).placeholder,
            this.evalForEachNode(node as ForEachNode)
          );
          break;
        case 'render':
          template = template.replace(
            (node as RenderNode).placeholder,
            this.evalRenderNode(node as RenderNode)
          );
          break;
        case 'include':
          template = template.replace(
            (node as IncludeNode).placeholder,
            Component.fetchTemplateSync((node as IncludeNode).path)
          );
          break;

        case 'print':
          template = template.replace(
            (node as PrintNode).placeholder,
            this.evalArgument((node as PrintNode).describer)
          );
          break;
        case 'log':
          console.log(this.evalArgument((node as LogNode).describer));
          break;
        case 'place':
          template = template.replace(
            (node as PlaceNode).placeholder,
            this.evalPlaceNode(node as PlaceNode)
          );
          break;
        default:
          throw new InternalError(`Unexpected node type ${node.type}`);
      }
    });

    return template;
  }

  private async evalNodesAsync(
    nodes: Node[] | undefined,
    template: string
  ): Promise<string> {
    if (!nodes) return template;

    for (const node of nodes) {
      switch (node.type) {
        case 'if':
          template = template.replace(
            (node as IfNode).placeholder,
            this.evalIfNode(node as IfNode)
          );
          break;
        case 'foreach':
          template = template.replace(
            (node as ForEachNode).placeholder,
            this.evalForEachNode(node as ForEachNode)
          );
          break;
        case 'render':
          const temp = await this.evalRenderNodeAsync(node as RenderNode);
          template = template.replace((node as RenderNode).placeholder, temp);
          break;
        case 'include':
          template = template.replace(
            (node as IncludeNode).placeholder,
            await Component.fetchTemplateAsync((node as IncludeNode).path)
          );
          break;

        case 'print':
          template = template.replace(
            (node as PrintNode).placeholder,
            this.evalArgument((node as PrintNode).describer)
          );
          break;
        case 'log':
          console.log(this.evalArgument((node as LogNode).describer));
          break;
        case 'place':
          template = template.replace(
            (node as PlaceNode).placeholder,
            this.evalPlaceNode(node as PlaceNode)
          );
          break;
        default:
          throw new InternalError(`Unexpected node type ${node.type}`);
      }
    }

    return template;
  }

  private evalIfNode(node: IfNode): string {
    if (node.ifBlock && node.ifBlock.condition) {
      if (this.evalCondition(node.ifBlock.condition.description)) {
        return this.evalNodes(node.ifBlock.nodes, node.ifBlock.body);
      } else if (node.elseIfBlocks) {
        for (let index = 0; index < node.elseIfBlocks.length; index++) {
          const block = node.elseIfBlocks[index];
          if (block.condition) {
            if (this.evalCondition(block.condition.description)) {
              return this.evalNodes(block.nodes, block.body);
            }
          } else throw new InternalError('Missing else if block condition');
        }
      } else if (node.elseBlock) {
        return this.evalNodes(node.elseBlock.nodes, node.elseBlock.body);
      }
      return '';
    } else throw new InternalError('Invalid if block provided');
  }

  private evalCollection(describer: Describer): Array<any> {
    const collection = this.evalArgument(describer);

    if (isNonEmptyArray(collection)) return collection as Array<any>;

    throw new ComponentError(
      `Invalid foreach statement collection type in '${describer.templateName}' at line number ${describer.lineNumber}`
    );
  }

  private evalForEachNode(node: ForEachNode): string {
    const collection = this.evalCollection(node.collection);
    const forEachBodies: string[] = [];

    for (let index = 0; index < collection.length; index++) {
      const item = collection[index];
      const scope = [{ name: node.item, value: item }];

      if (node.index) scope.push({ name: node.index, value: index });

      this.scopes.create(scope, this.templateName, node.lineNumber);

      forEachBodies.push(this.evalNodes(node.nodes, node.body));

      this.scopes.delete();
    }

    return forEachBodies.join('');
  }

  private evalRenderNode(node: RenderNode): string {
    let localArguments: LocalArgument<any>[] | null = null;
    let replacements: ReplaceArgument[] | null = null;

    if (node.locals) {
      localArguments = [];
      node.locals.forEach((local) => {
        localArguments?.push({
          name: local.key,
          value: this.evalArgument(local.value),
        });
      });
    }

    if (node.replaceNodes) {
      replacements = [];
      node.replaceNodes.forEach((replaceNode) => {
        replacements?.push({
          name: replaceNode.name,
          template: this.evalNodes(replaceNode.nodes, replaceNode.body),
        });
      });
    }

    return Component.render(node.path, localArguments, replacements);
  }

  private async evalRenderNodeAsync(node: RenderNode): Promise<string> {
    let localArguments: LocalArgument<any>[] | null = null;
    let replacements: ReplaceArgument[] | null = null;

    if (node.locals) {
      localArguments = [];
      node.locals.forEach((local) => {
        localArguments?.push({
          name: local.key,
          value: this.evalArgument(local.value),
        });
      });
    }

    if (node.replaceNodes) {
      replacements = [];
      node.replaceNodes.forEach((replaceNode) => {
        replacements?.push({
          name: replaceNode.name,
          template: this.evalNodes(replaceNode.nodes, replaceNode.body),
        });
      });
    }

    return await Component.renderAsync(node.path, localArguments, replacements);
  }

  private static clean(template: string): string {
    return template.replace(/ +/g, ' ').replace(/\n\s+/g, '\n');
  }
}
