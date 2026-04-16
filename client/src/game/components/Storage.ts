import { ComponentName, Event, StorageConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { RANGE_INTERACTING } from "@server/globals";

export class StorageComponent extends Component {
  private entity: Entity;
  private slots: number;
  private isOpen = false;
  private range = RANGE_INTERACTING;

  public name = ComponentName.STORAGE;

  constructor(entity: Entity, config: StorageConfig) {
    super();
    this.entity = entity;
    this.slots = config.slots;
  }

  attach(): void {
    this.entity.on("pointed", this._open, this);
    this.entity.scene.game.events.on(Event.STORAGE_CLOSE, this._close, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this._open, this);
    this.entity.scene.game.events.off(Event.STORAGE_CLOSE, this._close, this);
  }

  private _open(): void {
    if (this.isOpen || this.entity.isLocked) return;

    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const distance = Phaser.Math.Distance.Between(
      this.entity.x,
      this.entity.y,
      player.x,
      player.y,
    );

    if (distance > this.range) return;

    const animKey = `${this.entity.name}_tex_anim`;

    if (this.entity.scene.anims.exists(animKey)) this.entity.play(animKey);

    this.isOpen = true;
    
    this.entity.scene.game.events.emit(Event.STORAGE_OPEN, {
      entityId: this.entity.id,
      slots: this.slots,
    });
  }

  private _close(entityId: string): void {
    if (entityId !== this.entity.id) return;

    this.isOpen = false;
    const animKey = `${this.entity.name}_tex_anim`;

    if (this.entity.scene.anims.exists(animKey))
      this.entity.playReverse(animKey);
  }
}
