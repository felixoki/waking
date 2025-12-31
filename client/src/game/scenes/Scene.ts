import SocketManager from "../managers/Socket";
import { PlayerManager } from "../managers/Player";
import { PlayerConfig, PlayerInput } from "@server/types";
import { PhsyicsManager } from "../managers/Physics";

export class Scene extends Phaser.Scene {
  public physicsManager!: PhsyicsManager;
  public playerManager!: PlayerManager;
  public socketManager = SocketManager;

  create(): void {
    this.physicsManager = new PhsyicsManager(this);
    this.playerManager = new PlayerManager(this);

    this.socketManager.init();
    this.socketManager.emit("player:create");

    this._registerEvents();
  }

  update(): void {
    this.playerManager.update();
  }

  private _registerEvents(): void {
    this.socketManager.on("player:create:local", (data: PlayerConfig) => {
      this.playerManager.add(data, true);
    });
    
    this.socketManager.on("player:create:others", (data: PlayerConfig[]) => {
      data.forEach((player) => {
        this.playerManager.add(player, false);
      });
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

    this.game.events.once("destroy", this.shutdown, this);
  }

  shutdown(): void {
    this.socketManager.off("player:create:local");
    this.socketManager.off("player:create:others");
    this.socketManager.off("player:create");
    this.socketManager.off("player:left");
    this.socketManager.off("player:input");

    this.game.events.off("player:input");

    this.playerManager.destroy();
    this.socketManager.disconnect();
  }
}
