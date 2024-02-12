import { VariableStore } from './VariableStore';

export class LocalStore extends VariableStore {
  constructor() {
    super('local');
  }
}
