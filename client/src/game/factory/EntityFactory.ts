import {
  ComponentData,
  ComponentType,
  Entity,
  PositionData,
} from "@server/types";
import { EntityManager } from "../EntityManager";
import { Component } from "../components/Component";

export class EntityFactory {
  private factories: Map<string, (data: ComponentData) => Component>;

  constructor(private entityManager: EntityManager) {
    this.factories = this._setup();
  }

  create(entityData: { components: Record<string, ComponentData> }): Entity {
    const entity = this.entityManager.create();

    for (const [type, data] of Object.entries(entityData.components)) {
      const component = this._createComponent(type, data);
      if (component) this.entityManager.addComponent(entity, component);
    }

    return entity;
  }

  private _createComponent(type: string, data: ComponentData): Component | null {
    const factory = this.factories.get(type);
    if (!factory) return null;
    return factory(data);
  }

  private _setup(): Map<string, (data: ComponentData) => Component> {
    return new Map([
      [
        "position",
        (data: PositionData) => ({
          type: ComponentType.POSITION,
          x: data.x ?? 0,
          y: data.y ?? 0,
        }),
      ],
    ]);
  }
}
