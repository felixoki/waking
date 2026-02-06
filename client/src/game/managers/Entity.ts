import { EntityConfig } from "@server/types";
import { Entity } from "../Entity";
import { Scene } from "../scenes/Scene";
import { Factory } from "../factory/Factory";
import { configs } from "@server/configs";

export class EntityManager {
  private scene: Scene;
  public entities: Map<string, Entity> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  get(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  updateOne(): void {}

  update(): void {
    this.entities.forEach((entity) => entity.update());
  }

  add(config: EntityConfig): void {
    const definition = configs.definitions[config.name];
    const entity = Factory.create(this.scene, { ...config, ...definition! });

    this.entities.set(config.id, entity);
  }

  remove(id: string): void {
    const entity = this.entities.get(id);

    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }

  destroy(): void {
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();
  }

  getStatic(
    width: number,
    height: number,
  ): Array<{ x: number; y: number; width: number; height: number }> {
    return Array.from(this.entities.values()).flatMap((entity) => {
      const body = entity.body;
      if (
        !entity.body ||
        !this.scene.physicsManager.groups.entities.contains(entity)
      )
        return [];

      const left = body.x;
      const top = body.y;
      const right = body.x + body.width;
      const bottom = body.y + body.height;

      const startX = Math.floor(left / width);
      const startY = Math.floor(top / height);
      const endX = Math.ceil(right / width);
      const endY = Math.ceil(bottom / height);

      return [
        {
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
        },
      ];
    });
  }
}
