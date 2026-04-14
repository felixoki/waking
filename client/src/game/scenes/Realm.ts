import { MapName } from "@server/types";
import { Scene } from "./Scene";
import { MapFactory } from "../factory/Map";
import { TileManager } from "../managers/Tile";
import { configs } from "@server/configs";

export default class RealmScene extends Scene {
  constructor() {
    super(MapName.REALM);
  }

  preload() {
    const config = configs.maps[MapName.REALM];

    config.spritesheets.forEach((sheet) => {
      if (!this.textures.exists(sheet.key)) {
        this.load.spritesheet(sheet.key, `assets/sprites/${sheet.file}`, {
          frameWidth: sheet.frameWidth || 64,
          frameHeight: sheet.frameHeight || 64,
        });
      }
    });
  }

  create() {
    super.create();

    const map = MapFactory.create(this, MapName.REALM);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }

  teardown(): void {
    this.children.removeAll(true);
    this.tileManager?.destroy();
    this.tileManager = undefined!;
    this.cache.tilemap.remove(MapName.REALM);
  }

  rebuild(tilemap: any): void {
    super.create();

    this.cache.tilemap.add(MapName.REALM, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: tilemap,
    });

    const map = MapFactory.create(this, MapName.REALM);
    this.tileManager = new TileManager(map);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameraManager.fitZoom();
  }
}
