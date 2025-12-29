import { Direction, PlayerConfig, PlayerInput, StateName } from "@server/types";
import { Player } from "../Player";
import { EntityName } from "@server/configs";
import { Idle } from "../state/Idle";
import { Walking } from "../state/Walking";

export class PlayerManager {
  private scene: Phaser.Scene;
  public player?: Player;
  private others: Map<string, Player> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(): void {
    this.player?.update();
  }

  add(config: PlayerConfig, isLocal: boolean): void {
    const player = new Player(
      this.scene,
      config.x,
      config.y,
      `${EntityName.PLAYER}-${StateName.IDLE}`,
      config.id,
      EntityName.PLAYER,
      Direction.DOWN,
      new Map([
        [StateName.IDLE, new Idle()],
        [StateName.WALKING, new Walking()],
      ]),
      config.socketId,
      isLocal
    );

    if (isLocal) {
      this.player = player;
      return;
    }

    this.others.set(config.id, player);
  }

  updateOther(input: PlayerInput): void {
    const player = this.others.get(input.id);
    if (player) player.update(input);
  }

  remove(id: string): void {
    const player = this.others.get(id);

    if (player) {
      player.destroy();
      this.others.delete(id);
    }
  }
}
