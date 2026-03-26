import {
  ComponentName,
  EntityName,
  Event,
  HotbarSlotType,
} from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { HotbarComponent } from "./Hotbar";
import EventBus from "../EventBus";

let selected: EntityName | null = null;
EventBus.on(Event.SEEDS_SELECT, (seed: EntityName | null) => {
  selected = seed;
});

export class FarmableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.FARMABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this.plant, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this.plant, this);
  }

  plant(): void {
    const player = this.entity.scene.managers.players.player;
    if (!player) return;

    const hotbar = player.getComponent<HotbarComponent>(ComponentName.HOTBAR);
    const slot = hotbar?.get();

    if (
      !slot ||
      slot.type !== HotbarSlotType.ENTITY ||
      slot.name !== EntityName.HOE
    )
      return;

    if (!selected) return;

    this.entity.scene.game.events.emit(Event.ENTITY_PLANT, {
      seed: selected,
      x: this.entity.x,
      y: this.entity.y,
    });
  }
}
