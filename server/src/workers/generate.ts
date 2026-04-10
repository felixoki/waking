import { generateBiome } from "../biomes";

process.on("message", ({ biome, seed }) => {
  const res = generateBiome(biome, seed);
  process.send?.(res ?? null, undefined, undefined, () => process.exit(0));
});
