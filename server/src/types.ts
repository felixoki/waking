export interface PlayerConfig {
  id: string;
}

export type Entity = number;

export enum ComponentType {
  POSITION = "position",
  VELOCITY = "velocity",
}

export interface PositionData {
  x: number;
  y: number;
}

export interface VelocityData {
  x: number;
  y: number;
}

export type ComponentData = PositionData | VelocityData;