import { Socket } from "socket.io";
import { EntityName, EntityPickup, MapName } from "../types";
import { randomInt, randomUUID } from "crypto";
import { InstanceManager } from "../managers/Instance";

export const entity = {
  create: (socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const player = instance.players.getBySocketId(socket.id);
    if (!player || !player.isHost) return;

    const entity = {
      x: randomInt(0, 400),
      y: randomInt(0, 400),
      id: randomUUID(),
      map: MapName.VILLAGE,
      name: EntityName.ORC1,
      health: 100,
    };

    instance.entities.add(entity.id, entity);

    socket
      .to(`game:${instance.id}:${entity.map}`)
      .emit("entity:create", entity);
    socket.emit("entity:create", entity);
  },

  pickup: (data: EntityPickup, socket: Socket, instances: InstanceManager) => {
    const instance = instances.getBySocketId(socket.id);
    if (!instance) return;

    const entity = instance.entities.get(data.id);
    if (!entity) return;

    instance.entities.remove(data.id);

    socket
      .to(`game:${instance.id}:${entity.map}`)
      .emit("entity:destroy", { id: data.id });
  },
};
