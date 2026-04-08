import { EntityName } from "./entities";
import { MapName } from "./maps";
import { CollectorConfig } from "./collectors";
import { LightConfig } from "./ambience";
import { GrowthStageConfig } from "./farming";

export enum ComponentName {
  ANIMATION = "animation",
  BEHAVIOR_QUEUE = "behaviorQueue",
  BODY = "body",
  POINTABLE = "pointable",
  TEXTURE = "texture",
  INVENTORY = "inventory",
  PICKABLE = "pickable",
  HOVERABLE = "hoverable",
  HOTBAR = "hotbar",
  DAMAGEABLE = "damageable",
  TRANSITION = "transition",
  INTERACTABLE = "interactable",
  COLLECTOR = "collector",
  BOUNCE = "bounce",
  LIGHT = "light",
  TEXTURE_ANIMATION = "textureAnimation",
  FARMABLE = "farmable",
  GROWABLE = "growable",
  FELLABLE = "fellable",
  AURA = "aura",
}

export type ComponentConfig =
  | { name: ComponentName.ANIMATION }
  | { name: ComponentName.BEHAVIOR_QUEUE }
  | { name: ComponentName.BODY; config: BodyConfig }
  | { name: ComponentName.POINTABLE }
  | { name: ComponentName.TEXTURE; config: TextureConfig; key: string }
  | { name: ComponentName.INVENTORY }
  | { name: ComponentName.PICKABLE }
  | { name: ComponentName.HOVERABLE }
  | { name: ComponentName.HOTBAR }
  | { name: ComponentName.DAMAGEABLE; config?: DamageableConfig }
  | { name: ComponentName.TRANSITION; config: TransitionConfig }
  | { name: ComponentName.INTERACTABLE }
  | { name: ComponentName.COLLECTOR; config: CollectorConfig }
  | { name: ComponentName.BOUNCE }
  | { name: ComponentName.LIGHT; config: LightConfig }
  | { name: ComponentName.TEXTURE_ANIMATION; config: TextureAnimationConfig }
  | { name: ComponentName.FARMABLE }
  | { name: ComponentName.GROWABLE; config: GrowableConfig }
  | { name: ComponentName.FELLABLE }
  | { name: ComponentName.AURA; config: AuraConfig };

export interface AuraConfig {
  tints: number[];
  radius?: number;
  quantity?: number;
  frequency?: number;
  lifespan?: number;
}

export interface BodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  pushable?: boolean;
  immovable?: boolean;
  collides?: boolean;
  static?: boolean;
}

export interface TextureConfig {
  spritesheet: string;
  tileSize: number;
  tiles: { row: number; start: number; end: number }[];
}

export interface Item {
  name: EntityName;
  quantity: number;
  stackable: boolean;
}

export interface Transition {
  to: MapName;
  x: number;
  y: number;
}

export interface TransitionConfig {
  to: MapName;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface TextureAnimationConfig {
  spritesheet: string;
  tileSize: number;
  tiles: { row: number; start: number; end: number }[];
  frames: number;
  direction: "horizontal" | "vertical";
  frameRate: number;
  repeat: number;
}

export interface DamageableConfig {
  loot: (Item & { chance: number })[];
}

export interface GrowableConfig {
  spritesheet: string;
  tileSize: number;
  stages: GrowthStageConfig[];
  duration: number;
  yield: Item[];
  regrows?: boolean;
  needsWater?: boolean;
}
