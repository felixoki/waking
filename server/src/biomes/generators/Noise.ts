import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import { NoiseConfig } from "../../types/generation";
import { handlers } from "../../handlers";

export class NoiseGenerator {
  private noise2D: NoiseFunction2D;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;
  private scale: number;

  constructor(config: NoiseConfig = {}) {
    const seed = config.seed
      ? Math.abs(handlers.generation.hash(config.seed))
      : Math.random() * 2147483647;

    this.noise2D = createNoise2D(handlers.generation.seededRandom(seed));

    this.octaves = config.octaves || 4;
    this.persistence = config.persistence || 0.5;
    this.lacunarity = config.lacunarity || 2;
    this.scale = config.scale || 0.05;
  }

  generate(x: number, y: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < this.octaves; i++) {
      const sample = {
        x: x * this.scale * frequency,
        y: y * this.scale * frequency,
      };

      total += this.noise2D(sample.x, sample.y) * amplitude;

      maxValue += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return total / maxValue;
  }

  generateMap(width: number, height: number): number[][] {
    const map: number[][] = [];

    for (let y = 0; y < height; y++) {
      map[y] = [];

      for (let x = 0; x < width; x++) map[y][x] = this.generate(x, y);
    }

    return map;
  }
}
