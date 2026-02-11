import { Socket } from "socket.io";
import { EntityName, EntityPickup, Input, MapName } from "../types";
import { randomInt, randomUUID } from "crypto";
import { Game } from "../Game";

export const entity = {
  create: (socket: Socket, game: Game) => {
    const player = game.players.getBySocketId(socket.id);
    if (!player || !player.isHost) return;

    const entity = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      map: MapName.VILLAGE,
      name: EntityName.ORC1,
      health: 100,
    };

    game.entities.add(entity.id, entity);

    socket.to(`map:${entity.map}`).emit("entity:create", entity);
    socket.emit("entity:create", entity);
  },

  input: (data: Partial<Input>, socket: Socket, game: Game) => {
    const entity = game.entities.get(data.id!);
    if (!entity) return;

    entity.x = data.x ?? entity.x;
    entity.y = data.y ?? entity.y;

    socket.to(`map:${entity.map}`).emit("entity:input", data);
  },

  pickup: (data: EntityPickup, socket: Socket, game: Game) => {
    const entity = game.entities.get(data.id);
    if (!entity) return;

    game.entities.remove(data.id);

    socket.to(`map:${entity.map}`).emit("entity:destroy", { id: data.id });
  },
};
