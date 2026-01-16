import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { MapName } from "./types";

export class Instance {
  public readonly id: string;
  public readonly host: string;
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;

  constructor(id: string, host: string) {
    this.id = id;
    this.host = host;
    
    this.players = new PlayerStore();
    this.entities = new EntityStore();

    const loader = new MapLoader();

    const village = loader.load(configs.maps.village.json);
    const ents = loader.parseEntities(MapName.VILLAGE, village);

    ents.forEach((e) => this.entities.add(e.id, e));
  }
}
