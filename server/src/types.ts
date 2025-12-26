export interface PlayerConfig {
  id: string;
}

export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  JUMPING = "jumping",
  RUNNING = "running",
  SLASHING = "slashing",
}

export enum ComponentName {
  HEALTH = "health",
  VELOCITY = "velocity",
}