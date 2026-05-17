# Audit

| #   | File                                             | Severity | Category   | Issue                                                                                                                                              |
| --- | ------------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `client/src/game/vfx/emitters.ts`                | critical | PERF       | `slash()` creates ~120 particle emitters + 120 `delayedCall` timers per attack. `claw()` creates ~360. Pool emitters or use emit zones             |
| 2   | `client/src/game/vfx/emitters.ts`                | critical | PERF       | `dissolve()` creates one `scene.add.circle()` + one tween per opaque pixel. 32×32 sprite = ~500 game objects + 500 tweens. Use a shader dissolve   |
