import { ComponentName } from "@server/types";
import { CollectorComponent } from "../components/Collector";
import { Entity } from "../Entity";
import EventBus from "../EventBus";
import { InventoryComponent } from "../components/Inventory";
import { DialogueResponse } from "@server/types/dialogue";

export const interaction = {
  start(entity: Entity, data: DialogueResponse) {
    const collector = entity.getComponent<CollectorComponent>(
      ComponentName.COLLECTOR,
    );
    const inventory =
      entity.scene.managers.players?.player?.getComponent<InventoryComponent>(
        ComponentName.INVENTORY,
      );
    const items = inventory
      ?.get()
      .filter((item) => item && collector?.config.accepts.includes(item.name));

    EventBus.emit("interaction:start", {
      id: entity.id,
      ...(collector && {
        collects: items,
      }),
      text: data.text,
      choices: data.choices,
    });
  },
};
