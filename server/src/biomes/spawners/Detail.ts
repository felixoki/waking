import { handlers } from "../../handlers";
import { TerrainName, DetailConfig } from "../../types/generation";

export class DetailSpawner {
  spawn(
    terrain: TerrainName[],
    width: number,
    height: number,
    config: DetailConfig,
    firstgid: number,
  ): number[] {
    const data = new Array(width * height).fill(0);
    const occupied = new Set<number>();

    if (!config.stamps.length) return data;

    const indices: number[] = [];
    for (let i = 0; i < width * height; i++) indices.push(i);
    this._shuffle(indices);

    for (const idx of indices) {
      const x = idx % width;
      const y = Math.floor(idx / width);

      if (!config.terrains.includes(terrain[idx])) continue;
      if (Math.random() >= config.density) continue;

      const stamp =
        config.stamps[Math.floor(Math.random() * config.stamps.length)];

      let canPlace = true;
      for (const cell of stamp.tiles) {
        const cx = x + cell.dx;
        const cy = y + cell.dy;

        if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
          canPlace = false;
          break;
        }

        const cellIdx = handlers.generation.toIndex(cx, cy, width);

        if (
          !config.terrains.includes(terrain[cellIdx]) ||
          occupied.has(cellIdx)
        ) {
          canPlace = false;
          break;
        }
      }

      if (!canPlace) continue;

      for (const cell of stamp.tiles) {
        const cellIdx = handlers.generation.toIndex(
          x + cell.dx,
          y + cell.dy,
          width,
        );
        data[cellIdx] = firstgid + cell.tileId;
        occupied.add(cellIdx);
      }
    }

    return data;
  }

  private _shuffle(arr: number[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
