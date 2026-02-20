import { BiomeConfig, TerrainName } from "../types/generation";

export const forest: BiomeConfig = {
  id: "forest",
  width: 80,
  height: 80,
  tileWidth: 16,
  tileHeight: 16,

  noise: {
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    scale: 0.05,
  },

  layers: [
    {
      terrain: TerrainName.WATER,
      tileset: "village_farm_ground_grass",
      threshold: -0.3,
    },
    { terrain: TerrainName.GROUND, tileset: "village_home", threshold: 0.1 },
    { terrain: TerrainName.GRASS, tileset: "village_home", threshold: null },
  ],

  borders: [
    {
      from: TerrainName.GROUND,
      to: TerrainName.WATER,
      tileset: "water_coasts",
      collides: true,
    },
    {
      from: TerrainName.GRASS,
      to: TerrainName.WATER,
      tileset: "water_coasts",
      collides: true,
    },
    {
      from: TerrainName.GRASS,
      to: TerrainName.GROUND,
      tileset: "village_home",
      queryProperty: "terrain",
    },
  ],

  terrain: [TerrainName.GROUND, TerrainName.GRASS],
};
