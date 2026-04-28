import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  SpellName,
} from "../../types";

const book = (
  spell: SpellName,
  displayName: string,
  description: string,
): EntityDefinition => ({
  facing: Direction.DOWN,
  moving: [],
  components: [
    {
      name: ComponentName.TEXTURE,
      config: {
        spritesheet: "icons4",
        tileSize: 16,
        tiles: [
          { row: 5, start: 2, end: 3 },
          { row: 6, start: 2, end: 3 },
        ],
      },
      key: "spellbook_texture",
    },
    { name: ComponentName.POINTABLE },
    { name: ComponentName.PICKABLE },
    { name: ComponentName.HOVERABLE },
    { name: ComponentName.LEARNABLE, config: { spell } },
  ],
  states: [],
  behaviors: [],
  metadata: {
    displayName,
    description,
    stackable: false,
  },
});

export const spellbooks: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.SPELL_BOOK_SHARD]: book(
    SpellName.SHARD,
    "Spell book: Shard",
    "A weathered tome that unlocks the secrets of shard magic.",
  ),
  [EntityName.SPELL_BOOK_SLASH]: book(
    SpellName.SLASH,
    "Spell book: Slash",
    "A leather-bound grimoire on the art of arcane slashing.",
  ),
  [EntityName.SPELL_BOOK_ILLUMINATE]: book(
    SpellName.ILLUMINATE,
    "Spell book: Illuminate",
    "A glowing manuscript that teaches one how to bend light.",
  ),
  [EntityName.SPELL_BOOK_HURT_SHADOWS]: book(
    SpellName.HURT_SHADOWS,
    "Spell book: Hurt shadows",
    "A dark folio dense with shadow-banishing incantations.",
  ),
  [EntityName.SPELL_BOOK_METEOR_SHOWER]: book(
    SpellName.METEOR_SHOWER,
    "Spell book: Meteor shower",
    "An ancient scroll that teaches how to call fire from the sky.",
  ),
  [EntityName.SPELL_BOOK_BUTTERFLY_EFFIGY]: book(
    SpellName.BUTTERFLY_EFFIGY,
    "Spell book: Butterfly effigy",
    "A delicate journal containing the rites of the butterfly.",
  ),
  [EntityName.SPELL_BOOK_LIGHTNING_STRIKE]: book(
    SpellName.LIGHTNING_STRIKE,
    "Spell book: Lightning strike",
    "A charred tome that crackles with residual static energy.",
  ),
};
