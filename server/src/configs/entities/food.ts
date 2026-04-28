import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
} from "../../types";

export const food: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.VENISON_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 6, start: 16, end: 16 }],
        },
        key: "venison_meat_texture",
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
      displayName: "Venison meat",
      description: "A cut of fresh venison taken from wild game.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 6, col: 16 },
    },
  },
  [EntityName.BOAR_MEAT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 6, start: 16, end: 16 }],
        },
        key: "boar_meat_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Boar meat",
      description: "A cut of tough meat taken from a wild boar.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 6, col: 16 },
    },
  },
  [EntityName.CARP]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 3, start: 14, end: 15 }, { row: 4, start: 14, end: 15 }],
        },
        key: "carp_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carp",
      description: "A sturdy river carp.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 4, col: 13 },
    },
  },
  [EntityName.PERCH]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 1, start: 26, end: 27 }, { row: 2, start: 26, end: 27 }],
        },
        key: "perch_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Perch",
      description: "A small striped perch, common in these waters.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 2, col: 25 },
    },
  },
  [EntityName.TROUT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "icons1",
          tileSize: 16,
          tiles: [{ row: 3, start: 8, end: 9 }, { row: 4, start: 8, end: 9 }],
        },
        key: "trout_texture",
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.PICKABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Trout",
      description: "A speckled brown trout, prized by anglers.",
      stackable: true,
      icon: { spritesheet: "icons1", row: 4, col: 7 },
    },
  },
};
