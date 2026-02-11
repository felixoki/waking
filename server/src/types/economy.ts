import { EntityName } from './entities';

export enum NeedName {
  MEAT = 'meat',
  VEGETABLES = 'vegetables',
  RESOURCES = 'resources',
}

export interface Tier {
  item: EntityName;
  tier: number;
}

export interface NeedConfig {
  name: NeedName;
  items: Tier[];
  consumption: Record<number, number>;
  threshold: Record<number, number>;
}