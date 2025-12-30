import { Direction } from "@server/types";
import { Scene } from "./Scene";
import { Entity } from "../Entity";

export default class Village extends Scene {
  constructor() {
    super("Village");
  }

  /**
   * Implement Preloader
   */
  preload() {
    this.load.spritesheet("player-idle", "assets/sprites/player_idle.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "player-walking",
      "assets/sprites/player_walking.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "player-running",
      "assets/sprites/player_running.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "player-jumping",
      "assets/sprites/player_jumping.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    this.load.spritesheet(
      "player-casting",
      "assets/sprites/player_casting.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
  }

  create() {
    super.create();

    const graphics = this.add.graphics();

    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("training-dummy", 32, 32);
    graphics.destroy();

    const dummy = new Entity(
      this,
      400,
      300,
      "training-dummy",
      "dummy",
      "TrainingDummy",
      Direction.DOWN,
      [],
      undefined
    );
    dummy.setInteractive();
    dummy.on("pointerdown", () => {
      /**
       * We should direct the player to the target on click
       */
      this.playerManager.player?.inputManager?.setTarget(dummy.id);
    });
  }
}
