import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import {
  DURATION_JUMPING,
  HEIGHT_JUMPING,
  SPEED_JUMPING,
} from "@server/globals";

export class Jumping implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  public name: StateName = StateName.JUMPING;

  enter(entity: Entity): void {
    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.direction);

    handlers.move.getVelocity(entity, SPEED_JUMPING);

    entity.scene.tweens.add({
      targets: entity,
      displayOriginY: entity.displayOriginY + HEIGHT_JUMPING,
      duration: DURATION_JUMPING / 2,
      yoyo: true,
      ease: "Sine.easeOut",
    });

    this.timer = entity.scene.time.delayedCall(DURATION_JUMPING, () => {
      this.exit(entity);
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    entity.body.setVelocity(0, 0);

    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
