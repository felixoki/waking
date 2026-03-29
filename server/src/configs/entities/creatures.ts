import {
  BehaviorName,
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  StateName,
} from "../../types";

export const creatures: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.ORC1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 12,
          height: 16,
          offsetX: 24,
          offsetY: 20,
          pushable: false,
        },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
    ],
  },
  [EntityName.GOBLIN1]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      { name: ComponentName.ANIMATION },
      {
        name: ComponentName.DAMAGEABLE,
        config: {
          loot: [
            {
              name: EntityName.QUARTZ1,
              quantity: 1,
              stackable: true,
              chance: 1,
            },
          ],
        },
      },
      { name: ComponentName.BEHAVIOR_QUEUE },
      {
        name: ComponentName.BODY,
        config: {
          width: 10,
          height: 12,
          offsetX: 26,
          offsetY: 22,
          pushable: false,
        },
      },
    ],
    states: [
      StateName.IDLE,
      StateName.WALKING,
      StateName.RUNNING,
      StateName.SLASHING,
    ],
    behaviors: [
      {
        name: BehaviorName.PATROL,
        config: {
          radius: 80,
          scan: { interval: 2000 },
          idle: { duration: 1000 },
          vision: 300,
          fov: Math.PI * 2,
        },
      },
      { name: BehaviorName.ATTACK },
    ],
  },
};
