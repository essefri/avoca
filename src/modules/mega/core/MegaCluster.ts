import { EventEmitter } from 'events';
import { MegaPool } from './MegaPool';

export class Cluster extends EventEmitter {
  protected activeConnections: Map<string, MegaPool>;

  protected frozenConnections: Map<string, MegaPool>;

  protected defaultConnection: string;

  protected connections: any;

  protected group: string;

  constructor(options: any) {
    super();

    this.activeConnections = new Map();
    this.frozenConnections = new Map();
  }

  private findConnection(regex: RegExp) {}

  private randomSelection(connections: Array<MegaPool>) {}

  private orderSelection(connections: Array<MegaPool>) {}

  public freeze(key: string) {}

  public isFrozen(key: string) {}

  public break(key: string) {}

  public isBroken(key: string) {}

  public get(key?: string | RegExp, selection?: 'RANDOM' | 'ORDER') {}

  public set(key: string, options: any) {}

  public end(key?: string | RegExp) {}

  public closeActive(names: string[] | RegExp) {}

  public closeFrozen(names: string[] | RegExp) {}
}
