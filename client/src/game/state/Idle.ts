import { ComponentName, StateName } from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";

export class Idle implements State {
  public name = StateName.IDLE;

  enter(entity: Entity): void {
    entity.setState(this.name);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.facing);
  }

  update(entity: Entity): void {
    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.facing);
  }

  exit(_entity: Entity): void {}
}
