import { EntityName, NeedConfig, NeedName } from "../types";

export const needs: NeedConfig[] = [
  {
    name: NeedName.FOOD,
    items: [
      { item: EntityName.VENISON_MEAT, tier: 1 },
      { item: EntityName.CARROT, tier: 1 },
      { item: EntityName.TOMATO, tier: 1 },
      { item: EntityName.CABBAGE, tier: 1 },
    ],
    consumption: {
      1: 0.5,
    },
    threshold: {
      1: 0.3,
    },
  },
  {
    name: NeedName.RESOURCES,
    items: [
      { item: EntityName.WOOD, tier: 1 },
      { item: EntityName.QUARTZ1, tier: 1 },
    ],
    consumption: {
      1: 0.5,
    },
    threshold: {
      1: 0.3,
    },
  },
];
