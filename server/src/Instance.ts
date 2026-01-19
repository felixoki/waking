import { configs } from "./configs";
import { MapLoader } from "./loaders/Map";
import { EntityStore } from "./stores/Entity";
import { PlayerStore } from "./stores/Player";
import { ResourceStore } from "./stores/Resource";
import { MapName } from "./types";

export class Instance {
  public readonly id: string;
  public readonly host: string;
  public readonly players: PlayerStore;
  public readonly entities: EntityStore;
  public readonly resources: ResourceStore;

  constructor(id: string, host: string) {
    this.id = id;
    this.host = host;
    
    this.players = new PlayerStore();
    this.entities = new EntityStore();
    this.resources = new ResourceStore();

    const loader = new MapLoader();

    const village = loader.load(configs.maps.village.json);
    const ents = loader.parseEntities(MapName.VILLAGE, village);

    ents.forEach((e) => this.entities.add(e.id, e));
  }
}
