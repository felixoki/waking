import { generateBiome } from "../biomes";
import { tryCatchSync } from "../utils/tryCatch";

process.on("message", ({ biome, seed }) => {
  const { data, error } = tryCatchSync(() => generateBiome(biome, seed));

  if (error) {
    console.error("Worker generation failed:", error);
    process.exit(1);
  }

  process.send?.(data ?? null, undefined, undefined, () => process.exit(0));
});
