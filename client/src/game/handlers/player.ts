import {
  ComponentName,
  Event,
  MapName,
  PlayerConfig,
  StateName,
} from "@server/types";
import { InventoryComponent } from "../components/Inventory";
import { HotbarComponent } from "../components/Hotbar";
import type { MainScene } from "../scenes/Main";
import type RealmScene from "../scenes/Realm";
import { Entity } from "../Entity";
import { handlers } from ".";
import EventBus from "../EventBus";

export const player = {
  _transitioning: false,

  nearest: (
    entity: Entity,
    vision?: { distance: number; fov: number; rays?: number },
  ): {
    player: { x: number; y: number; id: string };
    distance: number;
  } | null => {
    const players = entity.scene.managers.players.all.filter(
      (p) => p && p.map === entity.map && p.state !== StateName.DEAD,
    );

    let nearest: { x: number; y: number; id: string } | null = null;
    let nearestDist = Infinity;

    for (const p of players) {
      if (
        vision &&
        !handlers.vision.canSee(
          entity.scene,
          entity,
          p,
          vision.distance,
          vision.fov,
          vision.rays ?? 5,
        )
      )
        continue;

      const dist = Phaser.Math.Distance.Between(entity.x, entity.y, p.x, p.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = p;
      }
    }

    if (!nearest) return null;
    return { player: nearest, distance: nearestDist };
  },

  swap: (data: PlayerConfig, main: MainScene): void => {
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

    main.game.events.emit(Event.CAMERA_FOLLOW, {
      key: data.map,
      player: updated,
    });

    EventBus.emit(Event.PLAYER_HEALTH, updated.health);
    EventBus.emit(Event.PLAYER_MANA, updated.mana);

    if (prev.map === MapName.REALM && data.map !== MapName.REALM)
      setTimeout(() => {
        main.entityManager.removeByMap(MapName.REALM);
        (main.scene.get(MapName.REALM) as RealmScene).teardown();
      }, 0);
  },

  transition: (data: PlayerConfig, main: MainScene): void => {
    if (!main.playerManager.player) return;
    if (player._transitioning) return;
    player._transitioning = true;

    EventBus.emit(Event.TRANSITION_START);

    const onReady = () => {
      EventBus.off(Event.TRANSITION_LOAD, onReady);
      player._transitioning = false;
      player.swap(data, main);
      EventBus.emit(Event.TRANSITION_END);
    };

    EventBus.on(Event.TRANSITION_LOAD, onReady);
  },
};
