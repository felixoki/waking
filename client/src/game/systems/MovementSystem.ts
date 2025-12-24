import { ComponentType } from "@server/types";
import { EntityManager } from "../EntityManager";
import { System } from "./System";
import { PositionComponent } from "../components/Position";
import { VelocityComponent } from "../components/Velocity";

export class MovementSystem extends System {
  constructor(entityManager: EntityManager) {
    super(entityManager);
  }

  update(delta: number): void {
    const entities = this.entityManager.query(
      ComponentType.POSITION,
      ComponentType.VELOCITY
    );

    for (const entity of entities) {
      const pos = this.entityManager.getComponent<PositionComponent>(
        entity,
        ComponentType.POSITION
      );
      const vel = this.entityManager.getComponent<VelocityComponent>(
        entity,
        ComponentType.VELOCITY
      );

      if (!pos || !vel) continue;

      pos.x += vel.x * delta;
      pos.y += vel.y * delta;
    }
  }
}
