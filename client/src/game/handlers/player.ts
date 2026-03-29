import { ComponentName, Event, MapName, PlayerConfig } from "@server/types";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import type { MainScene } from "../scenes/Main";
import type RealmScene from "../scenes/Realm";
import EventBus from "../EventBus";

export const player = {
  transition: (data: PlayerConfig, main: MainScene): void => {
    const current = main.playerManager.player;
    if (!current) return;

    const prev = {
      inventory: current
        .getComponent<InventoryComponent>(ComponentName.INVENTORY)
        ?.get(),
      hotbar: current
        .getComponent<HotbarComponent>(ComponentName.HOTBAR)
        ?.get(),
      map: current.map,
      scene: current.scene,
    };

    main.playerManager.remove(current.id);
    main.playerManager.add(data, true);

    const updated = main.playerManager.player!;

    updated.isLocked = false;
    updated
      .getComponent<InventoryComponent>(ComponentName.INVENTORY)
      ?.set(prev.inventory!);
    updated
      .getComponent<HotbarComponent>(ComponentName.HOTBAR)
      ?.set(prev.hotbar);

    const scene = main.scene.get(data.map);

    prev.scene.scene.setVisible(false);
    prev.scene.input.enabled = false;
    scene.scene.setVisible(true);
    scene.input.enabled = true;

    if (prev.map === MapName.REALM && data.map !== MapName.REALM) {
      main.entityManager.removeByMap(MapName.REALM);
      (main.scene.get(MapName.REALM) as RealmScene).teardown();
    }

    main.game.events.emit(Event.CAMERA_FOLLOW, {
      key: data.map,
      player: updated,
    });

    EventBus.emit(Event.PLAYER_HEALTH, updated.health);
    EventBus.emit(Event.PLAYER_MANA, updated.mana);
  },
};
