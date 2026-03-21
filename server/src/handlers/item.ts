import { Socket } from "socket.io";
import { Item } from "../types";
import { World } from "../World";

export const item = {
  collect: (data: Item, socket: Socket, world: World) => {
    world.items.add(data.name, data.quantity);

    socket.emit("item:remove", {
      name: data.name,
      quantity: data.quantity,
    });

    const snapshot = world.economy.getSnapshot();
    
    socket.emit("economy:update", snapshot);
    socket.broadcast.emit("economy:update", snapshot);
  },
};
