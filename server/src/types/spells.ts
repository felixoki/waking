export enum SpellName {
  SHARD = "shard",
  SLASH = "slash",
  ILLUMINATE = "illuminate",
  HURT_SHADOWS = "hurt_shadows",
}

export interface SpellConfig {
  name: SpellName;
  damage: number;
  knockback: number;
  speed?: number;
  range?: number;
  duration?: number;
  hitbox?: {
    width: number;
    height: number;
  };
}
