import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";

export class InteractableComponent extends Component {
  private entity: Entity;
  private range = 200;

  public name = ComponentName.INTERACTABLE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this._interact, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._interact, this);
  }

  private _interact(): void {
    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      this.entity.scene.game.input.activePointer.worldX,
      this.entity.scene.game.input.activePointer.worldY,
    );

    if (distance <= this.range)
      this.entity.scene.game.events.emit(
        "entity:dialogue:start",
        this.entity.id,
      );
  }
}
