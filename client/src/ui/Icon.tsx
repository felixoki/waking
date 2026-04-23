import { TILE_SIZE } from "@server/globals";
import { type Icon } from "@server/types";

export function Icon({ icon, zoom = 4 }: { icon: Icon; zoom?: number }) {
  return (
    <div
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundImage: `url('/assets/sprites/${icon.spritesheet}.png')`,
        backgroundPosition: `-${(icon.col - 1) * TILE_SIZE}px -${(icon.row - 1) * TILE_SIZE}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        zoom,
        flexShrink: 0,
      }}
    />
  );
}
