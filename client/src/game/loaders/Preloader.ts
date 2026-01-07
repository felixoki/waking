import { MapName } from "@server/types";
import { Scene } from "../scenes/Scene";
import { MAPS } from "@server/configs";

export class Preloader {
  static load(scene: Scene, map: MapName) {
    const config = MAPS[map];

    if (!config) throw new Error(`Map config for ${map} not found`);

    scene.load.tilemapTiledJSON(config.id, `assets/maps/${config.json}`);

    config.spritesheets.forEach((spritesheet) => {
      scene.load.spritesheet(
        spritesheet.key,
        `assets/sprites/${spritesheet.file}`,
        {
          frameWidth: spritesheet.frameWidth || 64,
          frameHeight: spritesheet.frameHeight || 64,
        }
      );
    });
  }
}
