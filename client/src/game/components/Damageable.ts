import { ComponentName } from "@server/types";
import { Component } from "./Component";

export class DamageableComponent extends Component {
  public name = ComponentName.DAMAGEABLE;

  attach(): void {}
  update(): void {}
  detach(): void {}
}
