import { AuraConfig, ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";

export class AuraComponent extends Component {
  name = ComponentName.AURA;

  private entity: Entity;
  private ambient: Phaser.GameObjects.Particles.ParticleEmitter;
  private ambientWhite: Phaser.GameObjects.Particles.ParticleEmitter;
  private black: Phaser.GameObjects.Particles.ParticleEmitter;
  private white: Phaser.GameObjects.Particles.ParticleEmitter;
  private tints: number[];
  private trailTimer: number = 0;
  private trailInterval: number = 80;
  private lastDepth: number = 0;

  constructor(entity: Entity, config: AuraConfig) {
    super();

    this.entity = entity;
    this.tints = config.tints;
    this.lastDepth = entity.depth - 1;

    this.ambient = entity.scene.add.particles(
      entity.x,
      entity.y,
      "particle_square",
      {
        tint: this.tints,
        alpha: { start: 0.7, end: 0 },
        scale: { start: 0.15, end: 0.02 },
        speed: { min: 3, max: 12 },
        angle: { min: 0, max: 360 },
        lifespan: config.lifespan ?? 4000,
        frequency: config.frequency ?? 80,
        quantity: config.quantity ?? 3,
        blendMode: "NORMAL",
      },
    );
    this.ambient.setDepth(this.lastDepth);

    this.ambientWhite = entity.scene.add.particles(
      entity.x,
      entity.y,
      "particle_square",
      {
        tint: [0xccccff, 0xddddff, 0xeeeeff, 0xffffff],
        alpha: { start: 0.5, end: 0 },
        scale: { start: 0.1, end: 0.01 },
        speed: { min: 3, max: 10 },
        angle: { min: 0, max: 360 },
        lifespan: 3500,
        frequency: 120,
        quantity: 1,
        blendMode: "ADD",
      },
    );
    this.ambientWhite.setDepth(this.lastDepth);

    this.black = entity.scene.add.particles(0, 0, "particle_square", {
      tint: this.tints,
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0.12, end: 0.01 },
      speed: { min: 3, max: 12 },
      angle: { min: 0, max: 360 },
      lifespan: 5000,
      quantity: 3,
      frequency: -1,
      blendMode: "NORMAL",
    });
    this.black.setDepth(this.lastDepth);

    this.white = entity.scene.add.particles(0, 0, "particle_square", {
      tint: [0xccccff, 0xddddff, 0xffffff],
      alpha: { start: 0.4, end: 0 },
      scale: { start: 0.08, end: 0.01 },
      speed: { min: 3, max: 10 },
      angle: { min: 0, max: 360 },
      lifespan: 4000,
      quantity: 2,
      frequency: -1,
      blendMode: "ADD",
    });
    this.white.setDepth(this.lastDepth);
  }

  update(): void {
    const { x, y } = this.entity;
    const body = this.entity.body as Phaser.Physics.Arcade.Body;
    const depth = this.entity.depth - 1;

    this.ambient.setPosition(x, y);
    this.ambientWhite.setPosition(x, y);

    if (depth !== this.lastDepth) {
      this.lastDepth = depth;
      this.ambient.setDepth(depth);
      this.ambientWhite.setDepth(depth);
      this.black.setDepth(depth);
      this.white.setDepth(depth);
    }

    const isMoving =
      body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1);
    const speed = body
      ? Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2)
      : 0;
    const interval = speed > 200 ? 10 : this.trailInterval;

    if (isMoving) {
      this.trailTimer += this.entity.scene.game.loop.delta;

      if (this.trailTimer >= interval) {
        this.trailTimer = 0;
        this.black.emitParticleAt(x, y);
        this.white.emitParticleAt(x, y);
      }
    } else this.trailTimer = 0;
  }

  detach(): void {
    this.ambient.destroy();
    this.ambientWhite.destroy();
    this.black.destroy();
    this.white.destroy();
  }
}
