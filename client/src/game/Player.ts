import { Entity } from "./Entity";
import { InputManager } from "./managers/Input";

export class Player extends Entity {
  public socketId: string;
  public isControllable: boolean;
  public inputManager?: InputManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: number,
    socketId: string,
    isControllable: boolean
  ) {
    super(scene, x, y, texture, id);

    this.socketId = socketId;
    this.isControllable = isControllable;

    if (this.isControllable) this.inputManager = new InputManager(this.scene);
  }
}
