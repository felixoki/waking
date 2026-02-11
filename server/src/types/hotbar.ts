import { SpellName } from './spells';
import { EntityName } from './entities';

export enum HotbarSlotType {
  SPELL = "spell",
  ENTITY = "entity",
}

export interface HotbarSlot {
  type: HotbarSlotType;
  name: SpellName | EntityName;
}

export enum HotbarDirection {
  PREV = "prev",
  NEXT = "next",
}
