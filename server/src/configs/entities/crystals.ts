import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const crystals: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.QUARTZ1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "crystals",
          tileSize: 16,
          tiles: [{ row: 8, start: 18, end: 18 }],
        },
        key: "quartz1_texture",
      },
      { name: ComponentName.POINTABLE },
      {
        name: ComponentName.PICKABLE,
      },
      {
        name: ComponentName.HOVERABLE,
      },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Quartz",
      description: "A small, delicate crystal with a pale glow.",
      stackable: true,
    },
  },
};
