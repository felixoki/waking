import { Server, Socket } from "socket.io";
import { Event, Item } from "../types";
import { World } from "../World";
import { handlers } from ".";

export const item = {
  collect: (data: Item, socket: Socket, io: Server, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (player) player.inventory = handlers.storage.remove(player.inventory, data);

    world.items.add(data.name, data.quantity);
    socket.emit(Event.ITEM_REMOVE, data);
    handlers.broadcast.economy(io, world);
    handlers.broadcast.store(io, world);
  },
};
