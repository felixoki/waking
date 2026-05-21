import { Server, Socket } from "socket.io";
import { EntityName, Event, SpellName } from "../types/index.js";
import { World } from "../World.js";
import { configs } from "../configs/index.js";
import { handlers } from "./index.js";

export const spell = {
  learn: (
    data: { spell: SpellName; entity: EntityName },
    socket: Socket,
    world: World,
  ) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.spells.includes(data.spell)) return;

    player.spells.push(data.spell);
    player.inventory = handlers.storage.remove(player.inventory, {
      name: data.entity,
      quantity: 1,
      stackable: false,
    });
    
    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  cast: (name: SpellName, socket: Socket, _io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.isDead) return;

    const config = configs.spells[name];
    if (!config) return;

    const mana = Math.max(player.mana - config.mana, 0);
    world.players.update(player.id, { mana });

    socket.emit(Event.PLAYER_MANA, mana);
  },
};
