import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ItemsStore } from "./stores/Items";
import { MapName } from "./types";
import { EconomyManager } from "./managers/Economy";
import { DAY } from "./globals";

export class Game {
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly items: ItemsStore;
  public economy: EconomyManager;
  private time: { current: number; days: number } = {
    current: 0,
    days: 0,
  };

  constructor() {
    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.items = new ItemsStore();
    this.economy = new EconomyManager(this.items);

    this.load();
  }

  load() {
    const loader = new MapLoader();

    const village = loader.load(configs.maps.village.json);
    const ve = loader.parseEntities(MapName.VILLAGE, village);

    const herbalist = loader.load(configs.maps.herbalist_house.json);
    const he = loader.parseEntities(MapName.HERBALIST_HOUSE, herbalist);

    [...ve, ...he].forEach((e) => this.entities.add(e.id, e));
  }

  update(delta: number) {
    this.time.current += delta;

    if (this.time.current >= DAY) {
      this.time.current = 0;
      this.time.days++;
    }

    this.economy.update();
  }
}
