import { EntityManager } from "../EntityManager";

export abstract class System {
  protected entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  abstract update(delta: number): void;
}
