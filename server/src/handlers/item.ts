import { Server, Socket } from "socket.io";
import { Event, Item } from "../types";
import { World } from "../World";
import { handlers } from ".";

export const item = {
  collect: (data: Item, socket: Socket, io: Server, world: World) => {
    world.items.add(data.name, data.quantity);

    socket.emit(Event.ITEM_REMOVE, {
      name: data.name,
      quantity: data.quantity,
    });

    handlers.broadcast.economy(io, world);
  },
};
