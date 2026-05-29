import { handlers } from "../../handlers";
import {
  DUNGEON_LOOP_CHANCE,
  DUNGEON_ROOM_ATTEMPTS,
  DUNGEON_ROOM_PADDING,
} from "../../globals";
import { BiomeConfig, Entity, Room, TerrainName } from "../../types/generation";

export class RoomGenerator {
  private config: BiomeConfig;
  private seed: string;
  private rooms: Room[] = [];

  constructor(config: BiomeConfig, seed: string) {
    this.config = config;
    this.seed = seed;
  }

  generate(): { terrain: TerrainName[]; entities: Entity[]; spawn?: { x: number; y: number } } {
    const { width, height } = this.config;
    const { tileWidth, tileHeight } = this.config;

    const terrain = new Array(width * height).fill(TerrainName.VOID);
    const entities: Entity[] = [];

    this._place();

    for (const room of this.rooms) this._rectify(terrain, room);

    const { edges, centers } = this._connect();
    const depths = this._depths(edges);

    for (const [a, b] of edges) this._corridor(terrain, centers[a], centers[b]);

    const cleaned = handlers.generation.removeProtrusions(
      terrain,
      width,
      height,
    );
    for (let i = 0; i < cleaned.length; i++) terrain[i] = cleaned[i];

    this._walls(terrain);

    const { rooms: roomConfig } = this.config;

    if (roomConfig) {
      const hash = handlers.generation.hash(`${this.seed}-rooms`);
      const rng = handlers.generation.seededRandom(hash);
      const assigned = handlers.generation.rooms.assign(
        this.rooms,
        depths,
        roomConfig,
        rng,
      );

      for (let i = 0; i < this.rooms.length; i++) {
        const room = this.rooms[i];
        const template = assigned[i];

        if (!template) continue;

        for (const piece of template.setpieces) {
          const count =
            piece.count.min +
            Math.floor(rng() * (piece.count.max - piece.count.min + 1));
          const place = handlers.generation.rooms.patterns[piece.pattern];

          for (let j = 0; j < count; j++) {
            const entity =
              piece.entities[Math.floor(rng() * piece.entities.length)];
            const pos = place(room, rng, this.config);
            entities.push({ name: entity, x: pos.x, y: pos.y });
          }
        }
      }
    }

    const spawnRoom = this.rooms[0];
    const spawn = spawnRoom
      ? { x: (spawnRoom.x + 2) * tileWidth, y: (spawnRoom.y + spawnRoom.height - 3) * tileHeight }
      : undefined;

    return { terrain, entities, spawn };
  }

  private _place() {
    const hash = handlers.generation.hash(this.seed);
    const rng = handlers.generation.seededRandom(hash);

    const { width, height } = this.config;
    if (!this.config.rooms) return;
    const { large, small } = this.config.rooms.distribution;

    const largeRange = large.yRange
      ? { min: Math.floor(large.yRange.min * height), max: Math.floor(large.yRange.max * height) }
      : undefined;

    handlers.generation.rooms.place(
      width,
      height,
      large.size,
      large.count.max,
      DUNGEON_ROOM_PADDING,
      this.rooms,
      rng,
      largeRange,
    );
    handlers.generation.rooms.place(
      width,
      height,
      small.size,
      DUNGEON_ROOM_ATTEMPTS,
      DUNGEON_ROOM_PADDING,
      this.rooms,
      rng,
    );
  }

  private _rectify(terrain: TerrainName[], room: Room) {
    const { width } = this.config;

    for (let dy = 0; dy < room.height; dy++)
      for (let dx = 0; dx < room.width; dx++)
        terrain[(room.y + dy) * width + (room.x + dx)] = TerrainName.FLOOR;
  }

  private _connect() {
    const gen = handlers.generation;
    const rng = gen.seededRandom(gen.hash(`${this.seed}-corridors`));
    const centers = this.rooms.map((r) => ({
      x: r.x + Math.floor(r.width / 2),
      y: r.y + Math.floor(r.height / 2),
    }));

    const n = centers.length;
    const inTree = new Array(n).fill(false);
    const edges: [number, number][] = [];

    inTree[0] = true;

    for (let added = 1; added < n; added++) {
      const best = { dist: Infinity, from: 0, to: 0 };

      for (let i = 0; i < n; i++) {
        if (!inTree[i]) continue;

        for (let j = 0; j < n; j++) {
          if (inTree[j]) continue;

          const dx = centers[i].x - centers[j].x;
          const dy = centers[i].y - centers[j].y;
          const dist = dx * dx + dy * dy;

          if (dist < best.dist) {
            best.dist = dist;
            best.from = i;
            best.to = j;
          }
        }
      }

      inTree[best.to] = true;
      edges.push([best.from, best.to]);
    }

    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const already = edges.some(
          ([a, b]) => (a === i && b === j) || (a === j && b === i),
        );

        if (!already && rng() < DUNGEON_LOOP_CHANCE) edges.push([i, j]);
      }

    const mstCount = n - 1;
    const degree = new Array(n).fill(0);

    for (const [a, b] of edges) {
      degree[a]++;
      degree[b]++;
    }

    for (let e = edges.length - 1; e >= mstCount; e--) {
      const [a, b] = edges[e];

      if (degree[a] > 4 || degree[b] > 4) {
        degree[a]--;
        degree[b]--;
        edges.splice(e, 1);
      }
    }

    return { edges, centers };
  }

  private _corridor(
    terrain: TerrainName[],
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) {
    const { width, height } = this.config;
    const direction = { x: to.x - from.x, y: to.y - from.y };

    for (let x = from.x; x !== to.x; x += Math.sign(direction.x))
      for (let dy = -1; dy <= 1; dy++) {
        const py = from.y + dy;
        if (py >= 0 && py < height) terrain[py * width + x] = TerrainName.FLOOR;
      }

    for (let y = from.y; y !== to.y; y += Math.sign(direction.y))
      for (let dx = -1; dx <= 1; dx++) {
        const px = to.x + dx;
        if (px >= 0 && px < width) terrain[y * width + px] = TerrainName.FLOOR;
      }

    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const px = to.x + dx;
        const py = from.y + dy;

        if (px >= 0 && px < width && py >= 0 && py < height)
          terrain[py * width + px] = TerrainName.FLOOR;
      }
  }

  private _walls(terrain: TerrainName[]) {
    const { width, height } = this.config;

    const layers: [TerrainName, TerrainName][] = [
      [TerrainName.FLOOR, TerrainName.WALL_BASE],
      [TerrainName.WALL_BASE, TerrainName.WALL_MID],
      [TerrainName.WALL_MID, TerrainName.WALL_TOP],
    ];

    for (const [below, becomes] of layers)
      for (let y = 0; y < height - 1; y++)
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;

          if (terrain[idx] !== TerrainName.VOID) continue;
          if (terrain[(y + 1) * width + x] === below) terrain[idx] = becomes;
        }
  }

  private _depths(edges: [number, number][]): number[] {
    const n = this.rooms.length;
    const adj: number[][] = Array.from({ length: n }, () => []);

    for (const [a, b] of edges) {
      adj[a].push(b);
      adj[b].push(a);
    }

    const depths = new Array(n).fill(-1);
    depths[0] = 0;

    const queue = [0];

    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];

      for (const neighbor of adj[current]) {
        if (depths[neighbor] !== -1) continue;
        depths[neighbor] = depths[current] + 1;
        queue.push(neighbor);
      }
    }

    return depths;
  }
}
