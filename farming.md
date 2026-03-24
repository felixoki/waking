# Farming

## Types

### server/src/types/components.ts

```ts
// ComponentName enum
FARMABLE = "farmable",
GROWABLE = "growable",

// ComponentConfig union
| { name: ComponentName.FARMABLE }
| { name: ComponentName.GROWABLE; config: GrowableConfig }

// Enum
export enum GrowthStage {
  SEED = "seed",
  SPROUT = "sprout",
  MATURE = "mature",
  HARVESTABLE = "harvestable",
}

// Interfaces
export interface GrowableConfig {
  spritesheet: string;
  tileSize: number;
  stages: GrowthStageConfig[];
  growthTime: number;
  yield: { name: EntityName; quantity: number }[];
  regrows?: boolean;
  needsWater?: boolean;
}

export interface GrowthStageConfig {
  stage: GrowthStage;
  at: number;
  tiles: { row: number; start: number; end: number }[];
  harvestable?: boolean;
}
```

### server/src/types/entities.ts

```ts
// EntityName enum
CARROT = "carrot",
CARROT_SEED = "carrot_seed",
FARMPLOT = "farmplot",
```

## Entity Definitions

### server/src/configs/entities/crops.ts

```ts
import {
  ComponentName,
  Direction,
  EntityDefinition,
  EntityName,
  GrowthStage,
} from "../../types";

export const crops: Partial<Record<EntityName, EntityDefinition>> = {
  [EntityName.FARMPLOT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "crops",
          tileSize: 16,
          tiles: [{ row: 0, start: 0, end: 0 }],
        },
        key: "farmplot_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: true,
        },
      },
      { name: ComponentName.FARMABLE },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
  },
  [EntityName.CARROT]: {
    facing: Direction.DOWN,
    moving: [],
    components: [
      {
        name: ComponentName.TEXTURE,
        config: {
          spritesheet: "crops",
          tileSize: 16,
          tiles: [{ row: 1, start: 0, end: 0 }],
        },
        key: "carrot_texture",
      },
      {
        name: ComponentName.BODY,
        config: {
          width: 16,
          height: 16,
          offsetX: 0,
          offsetY: 0,
          collides: false,
          static: true,
        },
      },
      {
        name: ComponentName.GROWABLE,
        config: {
          spritesheet: "crops",
          tileSize: 16,
          stages: [
            { stage: GrowthStage.SEED, at: 0.0, tiles: [{ row: 1, start: 0, end: 0 }] },
            { stage: GrowthStage.SPROUT, at: 0.25, tiles: [{ row: 1, start: 1, end: 1 }] },
            { stage: GrowthStage.MATURE, at: 0.6, tiles: [{ row: 1, start: 2, end: 2 }] },
            { stage: GrowthStage.HARVESTABLE, at: 1.0, tiles: [{ row: 1, start: 3, end: 3 }], harvestable: true },
          ],
          growthTime: 30_000,
          yield: [{ name: EntityName.CARROT, quantity: 2 }],
          regrows: false,
          needsWater: true,
        },
      },
      { name: ComponentName.POINTABLE },
      { name: ComponentName.HOVERABLE },
    ],
    states: [],
    behaviors: [],
    metadata: {
      displayName: "Carrot",
      description: "A crunchy orange root vegetable.",
      stackable: true,
    },
  },
};
```

## Components

### client/src/game/components/Farmable.ts

```ts
import { ComponentName } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { Player } from "../Player";
import { InventoryComponent } from "./Inventory";

export class FarmableComponent extends Component {
  private entity: Entity;

  public name = ComponentName.FARMABLE;

  constructor(entity: Entity) {
    super();

    this.entity = entity;
  }

  attach(): void {
    this.entity.on("pointed", this.plant, this);
  }

  update(): void {}

  detach(): void {
    this.entity.off("pointed", this.plant, this);
  }

  plant(player: Player): void {
    const inventory = player.getComponent<InventoryComponent>(
      ComponentName.INVENTORY,
    );

    const seed = inventory?.getSelectedSeed();
    if (!seed) return;

    inventory.remove(seed.name, 1);

    this.entity.scene.game.events.emit("entity:plant", {
      plotId: this.entity.id,
      seed: seed.name,
      x: this.entity.x,
      y: this.entity.y,
    });
  }
}
```

### client/src/game/components/Growable.ts

```ts
import { ComponentName, GrowableConfig, GrowthStageConfig } from "@server/types";
import { Component } from "./Component";
import { Entity } from "../Entity";
import { Player } from "../Player";
import { TextureComponent } from "./Texture";

export class GrowableComponent extends Component {
  private entity: Entity;
  private config: GrowableConfig;
  private elapsed: number = 0;
  private stageIndex: number = 0;
  private watered: boolean = false;

  public name = ComponentName.GROWABLE;

  constructor(entity: Entity, config: GrowableConfig) {
    super();

    this.entity = entity;
    this.config = config;
  }

  attach(): void {
    this.entity.on("pointed", this.harvest, this);
  }

  update(): void {
    if (this.config.needsWater && !this.watered) return;

    this.elapsed += this.entity.scene.game.loop.delta;

    const progress = Math.min(this.elapsed / this.config.growthTime, 1);
    const index = this.getStageIndex(progress);

    if (index !== this.stageIndex) {
      this.stageIndex = index;
      this.applyStage(this.config.stages[index]);
    }
  }

  detach(): void {
    this.entity.off("pointed", this.harvest, this);
  }

  water(): void {
    this.watered = true;
  }

  private harvest(player: Player): void {
    const stage = this.config.stages[this.stageIndex];
    if (!stage.harvestable) return;

    this.entity.scene.game.events.emit("entity:harvest", {
      entityId: this.entity.id,
      yield: this.config.yield,
    });

    if (this.config.regrows) {
      this.elapsed = 0;
      this.stageIndex = 0;
      this.watered = false;
      this.applyStage(this.config.stages[0]);
    } else {
      this.entity.scene.managers.entities.remove(this.entity.id);
    }
  }

  private getStageIndex(progress: number): number {
    let index = 0;

    for (let i = 0; i < this.config.stages.length; i++)
      if (progress >= this.config.stages[i].at) index = i;

    return index;
  }

  private applyStage(stage: GrowthStageConfig): void {
    const texture = this.entity.getComponent<TextureComponent>(
      ComponentName.TEXTURE,
    );

    const { spritesheet, tileSize } = this.config;
    const key = `${this.entity.name}_${stage.stage}`;

    texture?.swap({ spritesheet, tileSize, tiles: stage.tiles }, key);
  }
}
```

## Texture Swap

### client/src/game/components/Texture.ts

```ts
// Add to TextureComponent:
swap(config: TextureConfig, key: string): void {
  this.config = config;
  this.key = key;

  this._create();

  this.entity.setTexture(this.key);
}
```

The existing `_create()` already skips if the key is cached in the scene texture manager. So the first time a stage renders it builds the texture, every subsequent time it's a no-op lookup. The key is derived from `${entityName}_${stageName}` — e.g. `carrot_sprout`, `carrot_harvestable`.

## Stretch Effect

### client/src/game/pipelines/Stretch.ts

```ts
import Phaser from "phaser";

const MultiPipeline = Phaser.Renderer.WebGL.Pipelines.MultiPipeline;

export class StretchPipeline extends MultiPipeline {
  private startTime: number = -999999;
  private amplitude: number = 0.15;
  private damping: number = 4.0;
  private squeeze: number = 0.5;

  constructor(game: Phaser.Game, name: string = "stretch") {
    super({
      name: name,
      game: game,
      vertShader: `
        #define SHADER_NAME STRETCH_VERT

        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform mat4 uProjectionMatrix;

        uniform float stretch_start_time;
        uniform float stretch_amplitude;
        uniform float stretch_damping;
        uniform float stretch_squeeze;
        uniform float current_time;

        attribute vec2 inPosition;
        attribute vec2 inTexCoord;
        attribute float inTexId;
        attribute float inTintEffect;
        attribute vec4 inTint;

        varying vec2 outTexCoord;
        varying float outTexId;
        varying float outTintEffect;
        varying vec4 outTint;

        void main() {
          vec2 position = inPosition;

          float elapsed = current_time - stretch_start_time;

          if (elapsed > 0.0 && elapsed < 400.0) {
            float normalizedY = inTexCoord.y;
            float vertexFactor = 1.0 - normalizedY;

            float decay = exp(-stretch_damping * elapsed / 1000.0);
            float pull = stretch_amplitude * decay * vertexFactor;

            position.y -= pull * 80.0;
            position.x += (inTexCoord.x - 0.5) * pull * -40.0 * stretch_squeeze;
          }

          gl_Position = uProjectionMatrix * vec4(position, 1.0, 1.0);

          outTexCoord = inTexCoord;
          outTexId = inTexId;
          outTint = inTint;
          outTintEffect = inTintEffect;
        }
      `,
    });
  }

  onPreRender() {
    super.onPreRender();

    this.set1f("stretch_start_time", this.startTime);
    this.set1f("stretch_amplitude", this.amplitude);
    this.set1f("stretch_damping", this.damping);
    this.set1f("stretch_squeeze", this.squeeze);
    this.set1f("current_time", this.game.loop.time);
  }

  trigger(
    amplitude: number = 0.15,
    damping: number = 4.0,
    squeeze: number = 0.5,
  ) {
    this.startTime = this.game.loop.time;
    this.amplitude = amplitude;
    this.damping = damping;
    this.squeeze = squeeze;
  }
}
```

### client/src/game/components/Stretch.ts

```ts
import { ComponentName } from "@server/types";
import { Entity } from "../Entity";
import { Component } from "./Component";
import { StretchPipeline } from "../pipelines/Stretch";

interface PoolEntry {
  pipeline: StretchPipeline;
  refs: number;
  startTime: number;
}

const pool = {
  entries: new Map<string, PoolEntry>(),
  nextId: 0,

  acquire(game: Phaser.Game, startTime: number, tolerance = 100): PoolEntry {
    for (const entry of pool.entries.values())
      if (Math.abs(entry.startTime - startTime) < tolerance) {
        entry.refs++;
        return entry;
      }

    const name = `stretch_pool_${pool.nextId++}`;
    const pipeline = new StretchPipeline(game, name);
    const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    renderer.pipelines.add(name, pipeline);

    const entry: PoolEntry = { pipeline, refs: 1, startTime };
    pool.entries.set(name, entry);

    return entry;
  },

  release(entry: PoolEntry, game: Phaser.Game): void {
    entry.refs--;

    if (entry.refs <= 0) {
      const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      renderer.pipelines.remove(entry.pipeline.name);
      pool.entries.delete(entry.pipeline.name);
    }
  },
};

export function stretch(entity: Entity, onComplete?: () => void): void {
  const game = entity.scene.game;
  const now = game.loop.time;

  const entry = pool.acquire(game, now);
  entry.pipeline.trigger(0.15, 4.0, 0.5);
  entity.setPipeline(entry.pipeline.name);

  entity.scene.time.delayedCall(400, () => {
    entity.resetPipeline();
    pool.release(entry, game);

    onComplete?.();
  });
}
```

## Stretch Integration

### client/src/game/components/Pickable.ts

```ts
// In pickup(), before removing the entity:
import { stretch } from "./Stretch";

pickup(player: Player): void {
  const inventory = player.getComponent<InventoryComponent>(
    ComponentName.INVENTORY,
  );

  if (!inventory?.add(this.entity.name)) return;

  this.entity.scene.game.events.emit("entity:pickup", this.entity.id);

  stretch(this.entity, () => {
    this.entity.scene.managers.entities.remove(this.entity.id);
  });
}
```

### client/src/game/components/Growable.ts

```ts
// In harvest(), before removing/resetting:
import { stretch } from "./Stretch";

private harvest(player: Player): void {
  const stage = this.config.stages[this.stageIndex];
  if (!stage.harvestable) return;

  this.entity.scene.game.events.emit("entity:harvest", {
    entityId: this.entity.id,
    yield: this.config.yield,
  });

  stretch(this.entity, () => {
    if (this.config.regrows) {
      this.elapsed = 0;
      this.stageIndex = 0;
      this.watered = false;
      this.applyStage(this.config.stages[0]);
    } else {
      this.entity.scene.managers.entities.remove(this.entity.id);
    }
  });
}
```

## Handler

### server/src/handlers/farming.ts

```ts
import { Socket } from "socket.io";
import { EntityName } from "../types";
import { World } from "../World";

export const farming = {
  plant: (data: { plotId: string; seed: EntityName; x: number; y: number }, socket: Socket, world: World) => {
    socket.emit("entity:plant", data);
    socket.broadcast.emit("entity:plant", data);
  },

  harvest: (data: { entityId: string; yield: { name: EntityName; quantity: number }[] }, socket: Socket, world: World) => {
    for (const item of data.yield)
      world.items.add(item.name, item.quantity);

    const snapshot = world.economy.getSnapshot();

    socket.emit("economy:update", snapshot);
    socket.broadcast.emit("economy:update", snapshot);
  },
};
```

## Watering

Watering pauses growth until the player waters the plot. A crop with `needsWater: true` won't advance its `elapsed` timer until `water()` is called on the `GrowableComponent`.

Future additions:
- Watering can tool in hotbar
- Visual indicator (dry/wet soil texture swap on the farmplot)
- `entity:water` socket event
- Drying out over time (reset `watered` after N ms, requiring re-watering per stage)
