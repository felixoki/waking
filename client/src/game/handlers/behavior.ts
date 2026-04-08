import { BehaviorName, ComponentName } from "@server/types";
import { BehaviorQueue } from "../components/BehaviorQueue";
import { Entity } from "../Entity";
import { FleeBehavior } from "../behavior/Flee";
import { AttackBehavior } from "../behavior/Attack";
import { DefendBehavior } from "../behavior/Defend";

export const behavior = {
  react: (entity: Entity, targetId: string) => {
    const queue = entity.getComponent<BehaviorQueue>(
      ComponentName.BEHAVIOR_QUEUE,
    );
    if (!queue) return;

    const flee = queue.get<FleeBehavior>(BehaviorName.FLEE);

    if (flee) {
      flee.start(targetId);
      queue.shiftTo(BehaviorName.FLEE);
      return;
    }

    const defend = queue.get<DefendBehavior>(BehaviorName.DEFEND);

    if (defend) {
      queue.shiftTo(BehaviorName.DEFEND);
      return;
    }

    const attack = queue.get<AttackBehavior>(BehaviorName.ATTACK);

    if (attack) {
      attack.start(targetId);
      queue.shiftTo(BehaviorName.ATTACK);
    }
  },
};
