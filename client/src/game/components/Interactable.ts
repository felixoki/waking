import { ComponentName, Event } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import EventBus from "../EventBus";
import { RANGE_INTERACTING } from "@server/globals";
import { handlers } from "../handlers";

export class InteractableComponent extends Component {
  private entity: Entity;
  private range = RANGE_INTERACTING;

  public name = ComponentName.INTERACTABLE;

  constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this._interact, this);
  }

  update(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > this.range)
      EventBus.emit(Event.ENTITY_DIALOGUE_END, this.entity.id);
  }

  detach(): void {
    this.entity.off("pointed", this._interact, this);
  }

  private _interact(): void {
    if (this.entity.isLocked) return;

    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance <= this.range) {
      const dx = player.x - this.entity.x;
      const dy = player.y - this.entity.y;
      const facing = handlers.direction.fromAngle(Math.atan2(dy, dx));

      this.entity.scene.game.events.emit(Event.ENTITY_DIALOGUE_START, {
        entityId: this.entity.id,
        facing,
      });
    }
  }
}
