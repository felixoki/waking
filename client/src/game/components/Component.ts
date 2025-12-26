import { ComponentName } from "@server/types";

export abstract class Component {
  abstract name: ComponentName;

  attach(): void {}
  update(): void {}
  detach(): void {}
}
