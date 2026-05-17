import { INTERPOLATION_SPEED } from "@server/globals";

export const interpolation = {
  lerp(current: number, target: number, delta: number): number {
    const t = 1 - Math.exp(-INTERPOLATION_SPEED * (delta / 1000));
    return Phaser.Math.Linear(current, target, t);
  },
};
