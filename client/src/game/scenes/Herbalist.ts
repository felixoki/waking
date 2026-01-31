import { MapName } from "@server/types";
import { Preloader } from "../loaders/Preloader";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";

export class HerbalistScene extends Scene {
  constructor() {
    super("herbalist");
  }

  preload() {
    Preloader.load(this, MapName.HERBALIST);
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.HERBALIST);
    this.tileManager = new TileManager(map);
    this.cameraManager.setZoom(3);
  }
}
