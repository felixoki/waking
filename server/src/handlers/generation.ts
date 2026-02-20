import { TiledProperty } from "../types";
import { Neighbors, TERRAIN_ORDER, TerrainName } from "../types/generation";

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
};
