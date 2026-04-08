import {
  ComponentName,
  Direction,
  DirectionVectors,
  Event,
} from "@server/types";
import { DamageableComponent } from "../components/Damageable";
import { Entity } from "../Entity";
import { Hitbox } from "../Hitbox";
import { handlers } from ".";

export const combat = {
  hit: (obj1: any, obj2: any) => {
    const entity = obj1 as Entity;
    const hitbox = obj2 as Hitbox;

    const isAuthority = entity.scene.managers.players?.player?.isAuthority;

    const player = {
      target: entity.scene.managers.players?.get(entity.id),
      attacker: entity.scene.managers.players?.get(hitbox.ownerId),
    };

    if (
      hitbox.ownerId === entity.id ||
      hitbox.hits.has(entity.id) ||
      !isAuthority ||
      (player.target && player.attacker)
    )
      return;

    const damageable = entity.getComponent<DamageableComponent>(
      ComponentName.DAMAGEABLE,
    );
    if (!damageable) return;

    hitbox.hits.add(entity.id);

    entity.scene.game.events.emit(Event.HIT, {
      config: hitbox.config,
      attackerId: hitbox.ownerId,
      targetId: entity.id,
    });
  },

  hurt: (entity: Entity, health: number) => {
    entity.health = health;

    entity.scene.tweens.killTweensOf(entity);
    entity.setAlpha(1);

    entity.scene.tweens.add({
      targets: entity,
      alpha: 0.1,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  },

  knockback: (entity: Entity, knockback: { x: number; y: number }) => {
    if (entity.body.immovable) return;

    const body = entity.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(
      body.velocity.x + knockback.x,
      body.velocity.y + knockback.y,
    );
    body.setDrag(800);

    if (entity.knockback) entity.knockback.remove();

    entity.knockback = entity.scene.time.delayedCall(300, () => {
      body.setDrag(0);
      body.setVelocity(0, 0);

      entity.states?.get(entity.state)?.update(entity);
      entity.knockback = undefined;
    });
  },

  dodge: (
    entity: Entity,
    threatX: number,
    threatY: number,
    velocityX: number,
    velocityY: number,
    dashDistance: number,
  ): { moving: Direction[]; facing: Direction } => {
    const isProjectile = Math.abs(velocityX) > 10 || Math.abs(velocityY) > 10;

    if (isProjectile) {
      const isHorizontal = Math.abs(velocityX) > Math.abs(velocityY);

      const options: { moving: Direction[]; facing: Direction }[] = isHorizontal
        ? [
            { moving: [Direction.UP], facing: Direction.UP },
            { moving: [Direction.DOWN], facing: Direction.DOWN },
          ]
        : [
            { moving: [Direction.LEFT], facing: Direction.LEFT },
            { moving: [Direction.RIGHT], facing: Direction.RIGHT },
          ];

      for (const opt of options) {
        const { x: dx, y: dy } = DirectionVectors[opt.facing];
        if (handlers.path.isClear(entity, dx, dy, dashDistance)) return opt;
      }

      return { moving: [], facing: entity.facing };
    }

    const awayAngle = Phaser.Math.Angle.Between(
      threatX,
      threatY,
      entity.x,
      entity.y,
    );
    const offsets = [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2];

    for (const offset of offsets) {
      const angle = awayAngle + offset;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      if (handlers.path.isClear(entity, dx, dy, dashDistance)) {
        const moving = handlers.direction.fromVector(dx, dy);
        if (moving.length === 0)
          moving.push(handlers.direction.fromAngle(angle));
        return { moving, facing: handlers.direction.fromAngle(angle) };
      }
    }

    return { moving: [], facing: handlers.direction.fromAngle(awayAngle) };
  },
};
