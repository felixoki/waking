import {
  ComponentName,
  SpellConfig,
  SpellName,
  StateName,
} from "@server/types";
import { State } from "./State";
import { Entity } from "../Entity";
import { AnimationComponent } from "../components/Animation";
import { handlers } from "../handlers";
import { Player } from "../Player";
import { HotbarComponent } from "../components/Hotbar";
import { configs } from "@server/configs";
import EventBus from "../EventBus";

const COMBO_LOCK = 400;
const FINISHER_LOCK = 600;
const COMBO_WINDOW = 400;

export class Casting implements State {
  private timer: Phaser.Time.TimerEvent | null = null;
  private comboStep: number = 0;
  private comboTimer: Phaser.Time.TimerEvent | null = null;

  public name: StateName = StateName.CASTING;

  enter(entity: Entity): void {
    const hotbar = (entity as Player).getComponent<HotbarComponent>(
      ComponentName.HOTBAR,
    );
    const equipped = hotbar?.get();

    const config = configs.spells[equipped?.name as SpellName];
    const player = entity as Player;

    if (player.mana < config.mana) {
      const reset = entity.states?.get(StateName.IDLE);
      if (reset) reset.enter(entity);

      return;
    }

    entity.setState(this.name);
    entity.isLocked = true;

    const anim = entity.getComponent<AnimationComponent>(
      ComponentName.ANIMATION,
    );
    anim?.play(this.name, entity.facing);

    if (player.isControllable) {
      player.mana -= config.mana;
      EventBus.emit("player:mana", player.mana);
    }

    const direction = handlers.direction.getDirectionToPoint(
      entity,
      entity.target!,
    );

    const step = config.combo ? this.comboStep : 0;
    let stepConfig: SpellConfig = config;

    if (config.combo && step > 0 && step <= config.combo.length) {
      const comboStep = config.combo[step - 1];
      stepConfig = {
        ...config,
        damage: comboStep.damage,
        knockback: comboStep.knockback,
        duration: comboStep.duration ?? config.duration,
        hitbox: comboStep.hitbox,
      };
    }

    handlers.spells[config.name](
      entity,
      stepConfig,
      entity.target!,
      direction,
      step,
    );

    if (this.comboTimer) {
      this.comboTimer.destroy();
      this.comboTimer = null;
    }

    const isFinisher = config.combo && step >= config.combo.length;
    const duration = config.combo
      ? isFinisher
        ? FINISHER_LOCK
        : COMBO_LOCK
      : COMBO_LOCK;

    this.timer = entity.scene.time.delayedCall(duration, () => {
      this.exit(entity);

      if (config.combo && !isFinisher) {
        this.comboStep = step + 1;
        this.comboTimer = entity.scene.time.delayedCall(COMBO_WINDOW, () => {
          this.comboStep = 0;
          this.comboTimer = null;
        });

        return;
      }

      this.comboStep = 0;
    });
  }

  update(_entity: Entity): void {}

  exit(entity: Entity): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }

    entity.isLocked = false;

    const reset = entity.states?.get(StateName.IDLE);
    if (reset) reset.enter(entity);
  }
}
