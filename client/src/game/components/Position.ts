import { ComponentType } from "@server/types";
import { Component } from "./Component";

export interface PositionComponent extends Component {
  type: ComponentType.POSITION;
  x: number;
  y: number;
}