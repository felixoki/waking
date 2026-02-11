export enum Direction {
  DOWN = "down",
  UP = "up",
  LEFT = "left",
  RIGHT = "right",
}

export const DirectionVectors: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};
