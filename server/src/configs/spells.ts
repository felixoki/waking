import { SpellConfig, SpellName } from "../types";

export const spells: Record<SpellName, SpellConfig> = {
  [SpellName.SHARD]: {
    name: SpellName.SHARD,
    damage: 15,
    knockback: 50,
    mana: 10,
    speed: 300,
    range: 300,
    hitbox: {
      width: 10,
      height: 10,
    },
  },
  [SpellName.SLASH]: {
    name: SpellName.SLASH,
    damage: 25,
    knockback: 100,
    mana: 15,
    duration: 300,
    hitbox: {
      width: 40,
      height: 40,
    },
  },
  [SpellName.ILLUMINATE]: {
    name: SpellName.ILLUMINATE,
    damage: 0,
    knockback: 0,
    mana: 5,
    duration: 5000,
  },
  [SpellName.HURT_SHADOWS]: {
    name: SpellName.HURT_SHADOWS,
    damage: 75,
    knockback: 0,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 100,
      height: 100,
    },
  },
  [SpellName.METEOR_SHOWER]: {
    name: SpellName.METEOR_SHOWER,
    damage: 35,
    knockback: 80,
    mana: 25,
    duration: 300,
    radius: 40,
    hitbox: {
      width: 40,
      height: 40,
    },
  },
  [SpellName.BUTTERFLY_EFFIGY]: {
    name: SpellName.BUTTERFLY_EFFIGY,
    damage: 10,
    knockback: 15,
    mana: 20,
    duration: 1800,
    radius: 50,
    hitbox: {
      width: 8,
      height: 8,
    },
  },
  [SpellName.LIGHTNING_STRIKE]: {
    name: SpellName.LIGHTNING_STRIKE,
    damage: 50,
    knockback: 120,
    mana: 30,
    duration: 300,
    hitbox: {
      width: 30,
      height: 30,
    },
  },
};
