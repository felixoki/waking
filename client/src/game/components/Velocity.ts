import { ComponentType } from "@server/types";
import { Component } from "./Component";

export interface VelocityComponent extends Component {
  type: ComponentType.VELOCITY;
  x: number;
  y: number;
}
