import { Socket } from "socket.io";
import { Event, Item } from "../types";
import { World } from "../World";

export const item = {
  collect: (data: Item, socket: Socket, world: World) => {
    world.items.add(data.name, data.quantity);

    socket.emit(Event.ITEM_REMOVE, {
      name: data.name,
      quantity: data.quantity,
    });

    const snapshot = world.economy.getSnapshot();
    
    socket.emit(Event.ECONOMY_UPDATE, snapshot);
    socket.broadcast.emit(Event.ECONOMY_UPDATE, snapshot);
  },
};
