import { fork } from "child_process";
import { fileURLToPath } from "url";
import { TiledProperty } from "../types";
import {
  GeneratedMap,
  Neighbors,
  TERRAIN_ORDER,
  TerrainName,
} from "../types/generation";
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __ext = __filename.endsWith(".ts") ? "ts" : "js";

export const generation = {
  toIndex: (x: number, y: number, width: number): number => {
    return y * width + x;
  },

  inBounds: (x: number, y: number, width: number, height: number): boolean => {
    return x >= 0 && x < width && y >= 0 && y < height;
  },

  forEachNeighbor: (
    x: number,
    y: number,
    width: number,
    height: number,
    directions: ReadonlyArray<{ dx: number; dy: number }>,
    callback: (nx: number, ny: number, neighborIndex: number) => void,
  ): void => {
    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (generation.inBounds(nx, ny, width, height))
        callback(nx, ny, generation.toIndex(nx, ny, width));
    }
  },

  getNeighbors: <T>(
    grid: T[],
    x: number,
    y: number,
    width: number,
    height: number,
    fallback: T,
  ): Neighbors<T> => {
    const get = (dx: number, dy: number): T => {
      const nx = x + dx;
      const ny = y + dy;

      return generation.inBounds(nx, ny, width, height)
        ? grid[generation.toIndex(nx, ny, width)]
        : fallback;
    };

    return {
      north: get(0, -1),
      south: get(0, 1),
      west: get(-1, 0),
      east: get(1, 0),
      northwest: get(-1, -1),
      northeast: get(1, -1),
      southeast: get(1, 1),
      southwest: get(-1, 1),
    };
  },

  spiralSearch: (
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    predicate: (x: number, y: number) => boolean,
  ): { x: number; y: number } | null => {
    for (let radius = 0; radius < Math.max(width, height); radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

          const x = centerX + dx;
          const y = centerY + dy;

          if (generation.inBounds(x, y, width, height) && predicate(x, y))
            return { x, y };
        }
      }
    }

    return null;
  },

  getTerrainRank: (terrain: TerrainName): number => {
    return TERRAIN_ORDER.indexOf(terrain);
  },

  isTerrainAtOrAbove: (current: TerrainName, target: TerrainName): boolean => {
    return (
      generation.getTerrainRank(current) >= generation.getTerrainRank(target)
    );
  },

  hash: (str: string): number => {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }

    return hash;
  },

  hashToUnit: (hash: number): number => {
    return Math.abs(hash) / 2147483647;
  },

  spatialHash: (x: number, y: number, seed: number): number => {
    return ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0;
  },

  seededRandom: (seed: number): (() => number) => {
    let t = (seed >>> 0) + 0x6d2b79f5;
    return () => {
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  tileToWorld: (
    tileX: number,
    tileY: number,
    tileW: number,
    tileH: number,
  ) => ({
    x: tileX * tileW + tileW / 2,
    y: tileY * tileH + tileH / 2,
  }),

  parseProperties: (props?: TiledProperty[]): Record<string, any> => {
    const result: Record<string, any> = {};
    if (!props) return result;

    for (const p of props) result[p.name] = p.value;
    return result;
  },

  removeProtrusions: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const index = generation.toIndex(x, y, width);
        const current = result[index];

        const n = y > 0 ? terrain[index - width] : null;
        const s = y < height - 1 ? terrain[index + width] : null;
        const w = x > 0 ? terrain[index - 1] : null;
        const e = x < width - 1 ? terrain[index + 1] : null;

        const con = {
          h: w === current || e === current,
          v: n === current || s === current,
        };

        if (!con.h && !con.v) {
          const neighbors = [n, s, w, e].filter(
            (t): t is TerrainName => t !== null && t !== current,
          );

          if (neighbors.length) result[index] = neighbors[0];
        }

        if (con.v && !con.h) {
          const replacement = w ?? e;

          if (replacement && replacement !== current)
            result[index] = replacement;
        }

        if (con.h && !con.v) {
          const replacement = n ?? s;

          if (replacement && replacement !== current)
            result[index] = replacement;
        }
      }

    return result;
  },

  hasTerrainMargin: (
    x: number,
    y: number,
    margin: number,
    terrain: TerrainName[],
    allowed: TerrainName[],
    width: number,
    height: number,
  ): boolean => {
    for (let dy = -margin; dy <= margin; dy++)
      for (let dx = -margin; dx <= margin; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (!generation.inBounds(nx, ny, width, height)) return false;
        if (!allowed.includes(terrain[generation.toIndex(nx, ny, width)]))
          return false;
      }

    return true;
  },

  enforceMinimumWater: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const idx = generation.toIndex(x, y, width);
        if (result[idx] !== TerrainName.WATER) continue;

        const inBlock =
          (x + 1 < width &&
            y + 1 < height &&
            result[generation.toIndex(x + 1, y, width)] === TerrainName.WATER &&
            result[generation.toIndex(x, y + 1, width)] === TerrainName.WATER &&
            result[generation.toIndex(x + 1, y + 1, width)] ===
              TerrainName.WATER) ||
          (x - 1 >= 0 &&
            y + 1 < height &&
            result[generation.toIndex(x - 1, y, width)] === TerrainName.WATER &&
            result[generation.toIndex(x, y + 1, width)] === TerrainName.WATER &&
            result[generation.toIndex(x - 1, y + 1, width)] ===
              TerrainName.WATER) ||
          (x + 1 < width &&
            y - 1 >= 0 &&
            result[generation.toIndex(x + 1, y, width)] === TerrainName.WATER &&
            result[generation.toIndex(x, y - 1, width)] === TerrainName.WATER &&
            result[generation.toIndex(x + 1, y - 1, width)] ===
              TerrainName.WATER) ||
          (x - 1 >= 0 &&
            y - 1 >= 0 &&
            result[generation.toIndex(x - 1, y, width)] === TerrainName.WATER &&
            result[generation.toIndex(x, y - 1, width)] === TerrainName.WATER &&
            result[generation.toIndex(x - 1, y - 1, width)] ===
              TerrainName.WATER);

        if (!inBlock) {
          const neighbors: TerrainName[] = [];

          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]) {
            const nx = x + dx;
            const ny = y + dy;

            if (generation.inBounds(nx, ny, width, height)) {
              const t = result[generation.toIndex(nx, ny, width)];
              if (t !== TerrainName.WATER) neighbors.push(t);
            }
          }

          result[idx] = neighbors.length ? neighbors[0] : TerrainName.GRASS;
        }
      }

    return result;
  },

  enforceMinimumBlock: (
    terrain: TerrainName[],
    width: number,
    height: number,
    target: TerrainName,
    replacement: TerrainName,
  ): TerrainName[] => {
    const result = [...terrain];

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const idx = generation.toIndex(x, y, width);
        if (result[idx] !== target) continue;

        const inBlock =
          (x + 1 < width &&
            y + 1 < height &&
            result[generation.toIndex(x + 1, y, width)] === target &&
            result[generation.toIndex(x, y + 1, width)] === target &&
            result[generation.toIndex(x + 1, y + 1, width)] === target) ||
          (x - 1 >= 0 &&
            y + 1 < height &&
            result[generation.toIndex(x - 1, y, width)] === target &&
            result[generation.toIndex(x, y + 1, width)] === target &&
            result[generation.toIndex(x - 1, y + 1, width)] === target) ||
          (x + 1 < width &&
            y - 1 >= 0 &&
            result[generation.toIndex(x + 1, y, width)] === target &&
            result[generation.toIndex(x, y - 1, width)] === target &&
            result[generation.toIndex(x + 1, y - 1, width)] === target) ||
          (x - 1 >= 0 &&
            y - 1 >= 0 &&
            result[generation.toIndex(x - 1, y, width)] === target &&
            result[generation.toIndex(x, y - 1, width)] === target &&
            result[generation.toIndex(x - 1, y - 1, width)] === target);

        if (!inBlock) result[idx] = replacement;
      }

    return result;
  },

  unifyShores: (
    terrain: TerrainName[],
    width: number,
    height: number,
  ): TerrainName[] => {
    const result = [...terrain];
    const visited = new Set<number>();

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const start = generation.toIndex(x, y, width);
        if (result[start] !== TerrainName.WATER || visited.has(start)) continue;

        const region: number[] = [];
        const stack = [start];

        while (stack.length) {
          const idx = stack.pop()!;

          if (visited.has(idx)) continue;
          if (result[idx] !== TerrainName.WATER) continue;

          visited.add(idx);
          region.push(idx);

          const rx = idx % width;
          const ry = Math.floor(idx / width);

          if (rx > 0) stack.push(idx - 1);
          if (rx < width - 1) stack.push(idx + 1);
          if (ry > 0) stack.push(idx - width);
          if (ry < height - 1) stack.push(idx + width);
        }

        const counts = new Map<TerrainName, number>();
        const adjacent = new Set<number>();

        for (const idx of region) {
          const rx = idx % width;
          const ry = Math.floor(idx / width);

          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ]) {
            const nx = rx + dx;
            const ny = ry + dy;
            if (!generation.inBounds(nx, ny, width, height)) continue;
            const nIdx = generation.toIndex(nx, ny, width);
            const t = result[nIdx];
            if (t === TerrainName.WATER) continue;
            adjacent.add(nIdx);
            counts.set(t, (counts.get(t) ?? 0) + 1);
          }
        }

        if (!counts.size) continue;

        let dominant = TerrainName.GRASS;
        let maxCount = 0;

        for (const [t, c] of counts)
          if (c > maxCount) {
            maxCount = c;
            dominant = t;
          }

        /** Convert all non-water tiles within 3 of the water body to dominant */
        const buffer = 3;
        const converted = new Set<number>();

        for (const idx of region) {
          const rx = idx % width;
          const ry = Math.floor(idx / width);

          for (let dy = -buffer; dy <= buffer; dy++)
            for (let dx = -buffer; dx <= buffer; dx++) {
              const nx = rx + dx;
              const ny = ry + dy;
              if (!generation.inBounds(nx, ny, width, height)) continue;
              const nIdx = generation.toIndex(nx, ny, width);
              if (result[nIdx] === TerrainName.WATER) continue;
              if (result[nIdx] === dominant) continue;
              converted.add(nIdx);
            }
        }

        for (const nIdx of converted) result[nIdx] = dominant;
      }

    return result;
  },

  createLayer: (
    id: number,
    name: string,
    width: number,
    height: number,
    data: number[],
    properties?: TiledProperty[],
  ) => ({
    id,
    name,
    type: "tilelayer" as const,
    visible: true,
    width,
    height,
    data,
    opacity: 1,
    x: 0,
    y: 0,
    ...(properties ? { properties } : {}),
  }),

  start: (biome: string, seed: string): Promise<GeneratedMap | null> => {
    return new Promise((resolve, reject) => {
      const worker = fork(join(__dirname, `../workers/generate.${__ext}`), [], {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
      });

      const timeout = setTimeout(() => {
        worker.kill("SIGTERM");
        reject(new Error("Worker timed out"));
      }, 30_000);

      const cleanup = () => clearTimeout(timeout);

      worker.on("message", (result: GeneratedMap | null) => {
        cleanup();
        resolve(result);
      });
      worker.on("error", (err) => {
        cleanup();
        reject(err);
      });
      worker.on("exit", (code) => {
        cleanup();
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });

      worker.send({ biome, seed });
    });
  },
};
