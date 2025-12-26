import { StateName } from "@server/types";
import { Entity } from "../Entity";

export interface State {
  name: StateName;

  enter(entity: Entity): void;
  update(entity: Entity): void;
  exit(entity: Entity): void;
}
