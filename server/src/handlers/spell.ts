import { Socket } from "socket.io";
import { SpellName } from "../types/index.js";
import { World } from "../World.js";

export const spell = {
  learn: (data: { spell: SpellName }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    player.spells.push(data.spell);
  },
};
