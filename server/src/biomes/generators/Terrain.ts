import { handlers } from "../../handlers";
import { BiomeConfig, TerrainName } from "../../types/generation";
import { NoiseGenerator } from "./Noise";

export class TerrainGenerator {
  private noise: NoiseGenerator;
  private config: BiomeConfig;

  constructor(config: BiomeConfig) {
    this.config = config;
    this.noise = new NoiseGenerator(config.noise);
  }

  generate(): TerrainName[] {
    const { width, height, layers } = this.config;
    const noiseMap = this.noise.generateMap(width, height);
    const terrainMap: TerrainName[] = new Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const noise = noiseMap[y][x];
        let terrain = layers[layers.length - 1].terrain;

        for (let i = 0; i < layers.length - 1; i++) {
          if (noise < layers[i].threshold!) {
            terrain = layers[i].terrain;
            break;
          }
        }

        terrainMap[handlers.generation.toIndex(x, y, width)] = terrain;
      }
    }

    return terrainMap;
  }
}
