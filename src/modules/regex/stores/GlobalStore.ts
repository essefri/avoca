import { VariableStore } from './VariableStore';

export class GlobalStore extends VariableStore {
  constructor() {
    super('global');
  }
}
