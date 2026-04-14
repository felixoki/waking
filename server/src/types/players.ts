import { Direction } from './directions';
import { MapName } from './maps';
import { SpellName } from './spells';

export interface PlayerConfig {
  id: string;
  socketId: string;
  map: MapName;
  x: number;
  y: number;
  facing: Direction;
  health: number;
  mana: number;
  isAuthority: boolean;
  isDead: boolean;
  locked?: string;
  spells: SpellName[];
}
