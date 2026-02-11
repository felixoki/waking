import { Socket } from "socket.io";
import { Item } from "../types";
import { Game } from "../Game";

export const item = {
  collect: (data: Item, socket: Socket, game: Game) => {
    game.items.add(data.name, data.quantity);

    socket.emit("item:remove", {
      name: data.name,
      quantity: data.quantity,
    });
  },
};
