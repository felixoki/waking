export enum StateName {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  JUMPING = "jumping",
  CASTING = "casting",
  SLASHING = "slashing",
  ROLLING = "rolling",
}

export interface StateResolution {
  state: StateName;
  needsUpdate: boolean;
}
