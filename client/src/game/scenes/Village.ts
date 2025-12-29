import Phaser from "phaser";
import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import { PlayerConfig, PlayerInput } from "@server/types";

export default class Village extends Phaser.Scene {
  public socketManager = SocketManager;
  public playerManager!: PlayerManager;

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
  }

  create() {
    this.playerManager = new PlayerManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  update() {
    this.playerManager.update();
  }

  private _registerEvents() {
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);
    });

    this.socketManager.on("player:create", (data: PlayerConfig) => {
      this.playerManager.add(data, false);
    });

    this.socketManager.on("player:left", (data: { id: string }) => {
      this.playerManager.remove(data.id);
    });

    this.socketManager.on("player:input", (data: PlayerInput) => {
      this.playerManager.updateOther(data);
    });

    this.game.events.on("player:input", (data: PlayerInput) => {
      this.socketManager.emit("player:input", data);
    });
  }
}
