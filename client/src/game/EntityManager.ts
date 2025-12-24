import { ComponentType, Entity } from "@server/types";
import { Component } from "./components/Component";

export class EntityManager {
  private nextId: Entity = 1;
  private entities = new Set<Entity>();
  private components = new Map<ComponentType, Map<Entity, Component>>();

  create(): Entity {
    const entity = this.nextId++;
    this.entities.add(entity);
    return entity;
  }

  addComponent(entity: Entity, component: Component): void {
    const type = component.type;

    if (!this.components.has(type))
      this.components.set(type, new Map<Entity, Component>());

    this.components.get(type)!.set(entity, component);
  }

  removeComponent(entity: Entity, type: ComponentType): void {
    this.components.get(type)?.delete(entity);
  }

  getComponent<T extends Component>(
    entity: Entity,
    type: ComponentType
  ): T | undefined {
    return this.components.get(type)?.get(entity) as T | undefined;
  }

  hasComponent(entity: Entity, type: ComponentType): boolean {
    return this.components.get(type)?.has(entity) ?? false;
  }

  query(...componentTypes: ComponentType[]): Entity[] {
    const result: Entity[] = [];

    for (const entity of this.entities) {
      const hasAll = componentTypes.every((type) =>
        this.hasComponent(entity, type)
      );

      if (hasAll) result.push(entity);
    }

    return result;
  }
}
