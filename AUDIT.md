# Audit


## Critical

| # | File | Category | Issue |
|---|------|----------|-------|
| 1 | `server/src/handlers/combat.ts` | SECURITY | `hit()` trusts client-supplied `data.config` (damage, knockback, effects). Malicious client can send arbitrary values. Must look up config server-side by name |
| 2 | `server/src/handlers/farming.ts` | SECURITY | `harvest()` trusts client-supplied `data.yield` item array. Yield should be determined server-side from entity config |
| 3 | `server/src/handlers/spell.ts` | SECURITY | `cast()` doesn't verify the player knows the spell, and allows casting with 0 mana (`Math.max` clamps instead of rejecting) |
| 4 | `server/src/socket/index.ts` | BUG | `throw` inside async `socket.on` callback → unhandled promise rejection. Should `console.error` instead of throwing |
| 5 | `server/src/index.ts` | BUG | Autosave `setInterval` callback has no error handling — a failed `save.world()` or `save.player()` crashes the process |
| 6 | `server/src/lobby.ts` | BUG | Express async route handlers (`POST /worlds`, `GET /worlds`, etc.) have no try/catch — DB failures leak stack traces and crash |
| 7 | `server/src/handlers/combat.ts` | BUG | `revive()` emits `reviver.mana - REVIVE_MANA` but `reviver` was already mutated by `Object.assign` in `update()` → double subtraction, client mana desyncs |
| 8 | `client/src/game/state/Casting.ts` | BUG | Combo timer leak: `exit()` doesn't null `this.timer`, orphaned combo timers fire and reset `this.step`/`this.timer` mid-chain |
| 9 | `client/src/game/handlers/combat.ts` | BUG | `knockback()` accesses `entity.body.immovable` without null check — crashes if body is null |

---

## Moderate

| # | File | Category | Issue |
|---|------|----------|-------|
| 10 | `server/src/handlers/combat.ts` | BUG | No check that the attacker is alive — dead players can still deal damage |
| 11 | `server/src/handlers/combat.ts` | BUG | No range/proximity validation between attacker and target — client can hit any entity on any map |
| 12 | `server/src/handlers/spell.ts` | BUG | `learn()` doesn't check for duplicates — repeated calls push the same spell multiple times |
| 13 | `server/src/handlers/party.ts` | BUG | `start()` has no try/catch around `await handlers.generation.start()` — worker failure crashes the server |
| 14 | `server/src/handlers/party.ts` | BUG | `join()` doesn't check if player is already in another party — can join multiple simultaneously |
| 15 | `server/src/handlers/entity.ts` | BUG | `pickup()` always calls `remove()` even if player is null — entity destroyed but item never added to inventory |
| 16 | `server/src/handlers/farming.ts` | BUG | `harvest()` calls `remove()` before checking if player exists — entity destroyed but yield never given |
| 17 | `server/src/stores/Player.ts` | BUG | `update()` via `Object.assign` can change `socketId` without syncing the `bySocketId` index — `getBySocketId()` returns stale data |
| 18 | `server/src/managers/Economy.ts` | BUG | First `update()` computes elapsed time from constructor `Date.now()` — if there's a delay before first tick, a large burst of consumption drains all supply |
| 19 | `server/src/db/load.ts` | BUG | Redis fallthrough path: `pg.query()` not wrapped in `tryCatch` — DB error throws unhandled |
| 20 | `server/src/db/save.ts` | BUG | `save.player()` and `save.world()` have no error handling — any DB/Redis failure propagates as unhandled rejection |
| 21 | `server/src/lobby.ts` | BUG | Port allocator never reclaims freed ports — monotonically increments, eventually exhausts port space |
| 22 | `server/src/handlers/generation.ts` | LEAK | Forked worker process has no timeout and no `kill()` — stuck worker hangs forever |
| 23 | `server/src/index.ts` | LEAK | Tick and autosave `setInterval`s are never cleared — prevent clean shutdown |
| 24 | `server/src/handlers/authority.ts` | BUG | `world.players.get(id)!` non-null assertion after `transfer()` — crashes if player disconnected during transfer |
| 25 | `server/src/handlers/collector.ts` | BUG | `upgrade()` doesn't emit `ECONOMY_UPDATE` after tier change — clients don't see the tier update |
| 26 | `server/src/configs/entities/flora.ts` | BUG | `TREE4` uses `key: "tree5_texture"` — same key as `TREE5`. One overwrites the other on the client |
| 27 | `server/src/configs/entities/buildings.ts` | BUG | `HOUSE2` uses `key: "windmill_texture"` — same key as `WINDMILL`. Texture collision |
| 28 | `server/src/configs/entities/interior.ts` | BUG | `BOXES1` uses `key: "box1_texture"` — same key as `BOX1`. Texture collision |
| 29 | `client/src/game/scenes/Main.ts` | BUG | `spectate` reference not cleared on `PLAYER_LEAVE` — `update()` accesses destroyed player's `map`/`x`/`y` |
| 30 | `client/src/game/scenes/Main.ts` | BUG | `PLAYER_HURT` falls through to local player for unknown IDs: `others.get(id) \|\| player` applies damage to self if target left |
| 31 | `client/src/game/scenes/Main.ts` | BUG | `PARTY_START` listens for `Scenes.Events.CREATE` but a previously launched Realm emits `WAKE` instead — `onReady` never fires |
| 32 | `client/src/game/effects/*.ts` | BUG | Multiple effects call `clearTint()` on detach — removing one effect clears all other effects' tints |
| 33 | `client/src/game/state/Jumping.ts` | BUG | Jump tween not tracked or killed in `exit()` — tween continues modifying offset/body after state exits |
| 34 | `client/src/game/state/Throwing.ts` | LEAK | Rock `Image` created in `_launchRock()` not tracked — entity destruction before tween completes leaks the game object |
| 35 | `client/src/game/components/Pointable.ts` | BUG | `_onPointerDown` passes `scene.managers.players.player` which can be `undefined` — downstream listeners dereference it |
| 36 | `client/src/game/managers/Player.ts` | BUG | `get all()` returns `[...others.values(), this.player!]` — pushes `undefined` into array when player is null |
| 37 | `client/src/game/managers/Input.ts` | BUG | `destroy()` removes ALL scene `pointerdown`/`pointerup` listeners, not just its own |
| 38 | `client/src/game/scenes/Scene.ts` | LEAK | `CAMERA_FOLLOW` listener on `game.events` never removed in `shutdown()` — accumulates on scene re-creation |
| 39 | `client/src/game/scenes/Main.ts` | LEAK | Dozens of `EventBus`/`socket`/`game.events` listeners never cleaned up in `shutdown()` |
| 40 | `client/src/game/components/Bounce.ts` | LEAK | `delayedCall(2000)` not tracked — fires on destroyed entity if `detach()` called mid-animation |
| 41 | `client/src/game/components/Aura.ts` | LEAK | Pending trail `delayedCall` timers not cancelled in `detach()` — fire on destroyed emitters |
| 42 | `client/src/game/managers/Camera.ts` | LEAK | `resize` listener on global `scene.scale` persists after scene destruction — no `destroy()` method |
| 43 | `client/src/game/managers/Physics.ts` | LEAK | No `destroy()` — colliders/overlaps never cleaned up |
| 44 | `client/src/ui/Menu.tsx` | LEAK | `SocketManager.on("connect")` never unsubscribed |
| 45 | `client/src/ui/Menu.tsx` | BUG | No error/timeout handling on socket connect — loading state sticks forever on server failure |
| 46 | `client/src/ui/DamageNumbers.tsx` | BUG | `animate-damage-float` CSS class referenced but `@keyframes damage-float` never defined — numbers don't animate |
| 47 | `client/src/game/components/Interactable.ts` | PERF | `update()` emits `ENTITY_DIALOGUE_END` every frame for every interactable when player is out of range — even with no active dialogue |
| 48 | `client/src/ui/Effects.tsx` | PERF | `useNow` 100ms interval runs continuously even when no effects are active — 10 unnecessary re-renders/sec |

---

## Minor

| # | File | Category | Issue |
|---|------|----------|-------|
| 49 | `server/src/index.ts` | SECURITY | `cors: { origin: "*" }` on WebSocket server — any website can connect |
| 50 | `server/src/lobby.ts` | SECURITY | `/worlds/:id/start` has no authorization — anyone with a world ID can start it |
| 51 | `server/src/server.ts` | SECURITY | Hardcoded credential fallbacks (`REDIS_PASSWORD \|\| "waken"`) should not exist in production |
| 52 | `server/src/handlers/combat.ts` | BUG | `effects.apply()` casts weapon as spell for bonus lookup — false matches if spell/weapon share a name |
| 53 | `server/src/handlers/item.ts` | BUG | `consume()` pushes effect with hardcoded 1000ms duration regardless of actual effect config duration |
| 54 | `server/src/handlers/player.ts` | BUG | `delete()` unlocks entities but doesn't reset `entity.facing` (unlike `dialogue.end`) — NPCs stuck in non-default facing |
| 55 | `server/src/workers/generate.ts` | BUG | `process.send` callback calls `process.exit(0)` regardless of send error — hides failures |
| 56 | `server/src/managers/Economy.ts` | BUG | `upgradeTier()` has no max bound — tier exceeding config keys causes `undefined` consumption → NaN |
| 57 | `server/src/managers/Chunk.ts` | BUG | `moveEntity()` with undefined `prev` silently registers entity without ref-counting |
| 58 | `server/src/configs/animations.ts` | BUG | `BOAR` `SLASHING` animation has `repeat: -1` (infinite loop) — other attack anims use `repeat: 0`. May prevent state transitions |
| 59 | `server/src/db/schema.sql` | INCONSISTENCY | `player_data.updated_at` uses `TIMESTAMP`, `worlds.created_at` uses `TIMESTAMPTZ` — timezone mismatch |
| 60 | `server/src/handlers/party.ts` | BUG | `wipe()` resets inventory but only emits `PARTY_WIPE`, not `PLAYER_INVENTORY_WIPE` — client may not update inventory UI |
| 61 | `client/src/game/shaders/rend.frag` | DEAD | Empty file, no references in codebase |
| 62 | `client/src/game/handlers/state.ts` | DEAD | `needsUpdate` property defined on each selector but never read |
| 63 | `client/src/game/state/Casting.ts` | BUG | `exit()` doesn't reset `this.step` or null `this.timer` — stale references linger across enter/exit cycles |
| 64 | `client/src/game/state/Fishing.ts` | BUG | Fish arc tween `onComplete` accesses `entity.scene` without null guard — crashes if entity destroyed mid-flight |
| 65 | `client/src/game/behavior/Attack.ts` | BUG | `reset()` doesn't clear `cooldowns` or `lastAttackTime` — stale values persist across behavior queue repeats |
| 66 | `client/src/game/handlers/move.ts` | PERF | `new Phaser.Math.Vector2(0, 0)` allocated every frame for every moving entity — should reuse static vector |
| 67 | `client/src/game/managers/Interface.ts` | PERF | `update()` emits `ENTITIES_UPDATE` every frame with all entity health — should throttle or diff |
| 68 | `client/src/game/managers/Tile.ts` | PERF | `getCollisionGrid()` allocates full 2D array on every pathfinding call — should cache |
| 69 | `client/src/game/vfx/emitters.ts` | PERF | `dissolve()` creates a game object + tween per pixel — 64×64 sprite = 4000+ objects |
| 70 | `client/src/game/components/TextureAnimation.ts` | BUG | `attach()` shifts entity position by offset, `detach()` never reverses it — re-attach doubles the offset |
| 71 | `client/src/ui/Collector.tsx` | PERF | `STORE_SYNC` and `ECONOMY_UPDATE` update state while panel is closed — renders that return null |
| 72 | `client/src/ui/Collector.tsx` | BUG | `(configs as any).tiers` bypasses type safety — breaks silently if property is renamed |
| 73 | `client/src/ui/Dialogue.tsx` | DEAD | `isOpen` state is redundant with `data` — always set together |
| 74 | `client/src/ui/Seeds.tsx` | BUG | `active` seed selection persists across UI toggles — may desync from game state |
| 75 | `client/src/ui/Menu.tsx` | BUG | Hardcoded `http://` protocol — fails if deployment requires HTTPS/WSS |
| 76 | `client/src/ui/Menu.tsx` | BUG | No `AbortController` on fetch requests — rapid clicks can race |
| 77 | `server/src/lobby.ts` | LEAK | Idle reaper `setInterval` never cleared on shutdown |
| 78 | `server/src/types/states.ts` | DEAD | `StateResolution` interface exported but never used |
| 79 | `server/src/types/behaviors.ts` | DEAD | `BehaviorInput` interface exported but never used |
| 80 | `server/src/configs/effects.ts` | DEAD | `DamageType` imported but never used |

---

## Architectural Suggestions

| Area | Suggestion |
|------|-----------|
| **Server-side validation** | Establish a pattern for validating all client-supplied data at socket handler boundaries |
| **Socket error handling** | Replace `throw` with `console.error` in socket wrapper, add try/catch to all handlers |
| **Route error middleware** | Add Express async error handler middleware to lobby routes |
| **Effect tint stack** | Use a tint stack/priority system instead of `clearTint()` on each effect detach |
| **Combo timer ownership** | Track combo timer separately and cancel it explicitly in `enter()` / `exit()` |
| **EventBus cleanup** | Consider a `useEventBus` hook that auto-cleans on unmount |
| **Scene lifecycle** | Establish a pattern for cleaning up global listeners in `shutdown()` |
| **Interactable guard** | Only run distance check and emit `DIALOGUE_END` when a dialogue is actually active |
| **Effects.tsx gating** | Only start the `useNow` interval when `effects.size > 0` |
| **Entity texture keys** | Ensure all entity config texture keys are unique — or namespace them by entity name |
| **Worker timeout** | Add a timeout to `generation.start()` forked workers to prevent indefinite hangs |
| **Autosave guard** | Only save if world has changed (dirty flag) |
| **Worker import tree** | Extract `parseProperties` to standalone util to lighten worker imports |

---

## Performance — Networking

| # | File | Impact | Issue |
|---|------|--------|-------|
| P1 | `client/src/game/Player.ts` | **critical** | `PLAYER_INPUT` emitted to server **every frame** (60/sec) with zero change detection — even when standing still. Full `Input` struct (~300 bytes) sent unconditionally |
| P2 | `client/src/game/Entity.ts` | **critical** | `ENTITY_INPUT` emitted every frame for every authority entity with no change detection — dozens of entities × 60/sec |
| P3 | `server/src/handlers/player.ts` | **high** | Server re-broadcasts every received input to all players in the chunk — N players × 60 msgs/sec = O(N²) traffic |
| P4 | `client/src/game/Entity.ts`, `Player.ts` | **high** | Interpolation uses fixed `lerp(0.2)` per frame — frame-rate dependent. At 30fps entities converge half as fast as 60fps. No snapshot buffer, no extrapolation |
| P5 | `server/src/globals.ts` | **low** | Server tick at 60Hz but does no physics/movement simulation — 20Hz would suffice for regen/effects |

### Recommended approach

1. **Change detection** — only emit if `{x, y, state, facing, moving}` differs from last sent. 80-95% reduction for idle players
2. **Send rate throttle** — decouple network sends from frame rate, cap at 20Hz. 3× reduction
3. **Snapshot interpolation** — buffer 2-3 received positions with timestamps, interpolate between them using `now - interpDelay`
4. **Delta compression** — only send fields that changed since last packet
5. **Server-side batching** — collect per-tick updates and broadcast once per chunk per tick

---

## Performance — Phaser / Game Engine

| # | File | Impact | Issue |
|---|------|--------|-------|
| P6 | `client/src/game/vfx/emitters.ts` | **critical** | `slash()` creates ~120 particle emitters + 120 `delayedCall` timers per attack. `claw()` creates ~360. A 3-hit combo = ~360 emitters. Pool emitters or use a single emitter with emit zones |
| P7 | `client/src/game/vfx/emitters.ts` | **critical** | `dissolve()` creates one `scene.add.circle()` + one tween **per opaque pixel**. A 32×32 sprite = ~500 game objects + 500 tweens. Use a shader dissolve or sample every Nth pixel |
| P8 | `client/src/game/managers/Tile.ts` | **high** | `getCollisionGrid()` rebuilds full 2D collision array from scratch on every pathfinding call — iterates every tile in every layer. Should cache and only invalidate on tile changes |
| P9 | ~~removed~~ | | ~~Entities are chunk-managed — created on activation, destroyed on deactivation. No culling needed~~ |
| P10 | `client/src/game/managers/Interface.ts` | **high** | `update()` runs every frame: filters all entities, maps to health bar data, emits to React via EventBus. Should throttle to 100-200ms and only emit on actual health changes |
| P11 | `client/src/game/managers/Physics.ts` | **high** | No collision categories or groups — broad-phase checks every player against every entity. O(N²) scaling |
| P12 | `client/src/game/loaders/Preloader.ts` | **high** | All assets loaded as individual spritesheets — each is a separate WebGL texture and draw call break. Texture atlas packing would drastically reduce draw calls |
| P13 | `client/src/game/handlers/move.ts` | **medium** | `new Phaser.Math.Vector2(0, 0)` allocated every frame per moving entity — reuse a module-level static vector |
| P14 | `client/src/game/Entity.ts` | **medium** | Three object allocations per frame in `update()`: `prev = {}`, `prepared = { ...input }`, and the `resolve()` return. Reuse mutable objects on the class |
| P15 | `client/src/game/Player.ts` | **medium** | `_getInput()` creates a full `Input` object literal every frame for the local player — reuse a mutable input object |
| P16 | `client/src/game/handlers/path.ts` | **medium** | A* uses `open.sort()` + `shift()` per iteration (O(N log N)). A binary heap would be O(log N) |
| P17 | `client/src/game/components/Aura.ts` | **medium** | Creates 2 new emitter objects every 80ms while moving — up to ~125 live emitters during sustained movement. Use a single persistent trail emitter |
| P18 | `client/src/game/handlers/vision.ts` | **medium** | `intersects()` allocates `new Phaser.Geom.Line()` + `new Phaser.Geom.Circle()` per call — called 5-7× per `canSee()` during behavior scans |
| P19 | `client/src/game/managers/Player.ts` | **medium** | `get all()` creates a new array via spread on every call — called by behavior scan loops multiple times per frame. Cache and invalidate on add/remove |
| P20 | `client/src/game/components/Aura.ts` | **medium** | `setDepth()` called every frame on 2 emitters — marks display list dirty, forcing re-sort. Only call when entity depth actually changes |
| P21 | `client/src/game/managers/Input.ts` | **low** | `getMoving()` creates a new `Direction[]` array every frame — reuse a pre-allocated array |
| P22 | `client/src/game/factory/State.ts` | **low** | Creates all 11 state instances then discards unused ones — only instantiate requested states |
| P23 | `client/src/game/scenes/Scene.ts` | **low** | `shutdown()` doesn't call `scene.time.removeAllEvents()` or `scene.tweens.killAll()` — orphaned timers and tweens persist |

### Top 5 by impact

1. **VFX emitter explosion** (P6, P7) — slash/claw/dissolve create 100-1000+ game objects per use. Redesign with pooled emitters or shader effects
2. **Network flooding** (P1, P2, P3) — 60 emits/sec/player with no change detection or throttling. Add dirty flags + 20Hz send rate
3. **Collision grid rebuild** (P8) — full grid reconstructed on every pathfind call. Cache it
4. **InterfaceManager per-frame emit** (P10) — filter/map/emit every frame to React. Throttle + dirty check
5. **Draw call reduction** (P12) — pack spritesheets into texture atlases
