export interface PlayerConfig {
  id: string;
  socketId: string;
  x: number;
  y: number;
}

export interface PlayerInput {
  id: string;
  x: number;
  y: number;
  direction: Direction | null | undefined;
  directions: Direction[];
  state: StateName;
  nextState: StateName;
}

export interface StateResolution {
  state: StateName;
  needsUpdate: boolean;
}

export enum Direction {
  DOWN = "down",
  UP = "up",
  LEFT = "left",
  RIGHT = "right",
}

export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  JUMPING = "jumping",
  SLASHING = "slashing",
}

export enum ComponentName {
  ANIMATION = "animation",
}