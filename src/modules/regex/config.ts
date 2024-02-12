import { ExecFunc, Execable, GlobalArgument } from './Component';

export type RegexConfiguration = {
  path: string;
  globals: GlobalArgument<any>[];
  tools: (ExecFunc | Execable)[];
};
