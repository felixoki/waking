import { ComponentName, StateName } from "@server/types";
import { Entity } from "../Entity";
import { State } from "./State";
import { AnimationComponent } from "../components/Animation";

export class Walking implements State {
  public name = StateName.WALKING;

  enter(entity: Entity): void {
    entity.setState(this.name);

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION
    );
    anim?.play(this.name, entity.direction);
  }

  update(_entity: Entity): void {}

  exit(_entity: Entity): void {}
}
