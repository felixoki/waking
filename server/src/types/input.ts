import { Direction } from './directions';
import { StateName } from './states';
import { HotbarSlot } from './hotbar';

export interface Input {
  id: string;
  x: number;
  y: number;
  facing: Direction | null | undefined;
  moving: Direction[];
  isRunning: boolean;
  isJumping: boolean;
  isRolling: boolean;
  target?: { x: number; y: number };
  state: StateName;
  equipped: HotbarSlot | null | undefined;
}
