import { Socket } from "socket.io";
import { EntityConfig, EntityName, Event, Input, Spot } from "../types";
import { randomUUID } from "crypto";
import { World } from "../World";

export const entity = {
  create: (data: Omit<EntityConfig, "id">, socket: Socket, world: World) => {
    const config = {
      ...data,
      id: randomUUID(),
      createdAt: data.createdAt ?? Date.now(),
    };

    world.entities.add(config.id, config);
    world.chunks.registerEntity(config.id, config.map, config.x, config.y);

    const key = world.chunks.getChunkByEntity(config.id);
    if (key) socket.to(`chunk:${key}`).emit(Event.ENTITY_CREATE, config);
    socket.emit(Event.ENTITY_CREATE, config);
  },

  input: (data: Partial<Input>, socket: Socket, world: World) => {
    const entity = world.entities.get(data.id!);
    if (!entity) return;

    entity.x = data.x ?? entity.x;
    entity.y = data.y ?? entity.y;

    world.chunks.moveEntity(data.id!, entity.map, entity.x, entity.y);

    const key = world.chunks.getChunkByEntity(data.id!);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit(Event.ENTITY_INPUT, data);
  },

  pickup: (data: string, socket: Socket, world: World) => {
    const entity = world.entities.get(data);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(entity.id);

    world.chunks.removeEntity(entity.id);
    world.entities.remove(entity.id);

    const player = world.players.getBySocketId(socket.id);
    const party = player && world.parties.getByPlayerId(player.id);

    if (party) socket.to(`party:${party.id}`).emit(Event.ENTITY_DESTROY, entity.id);
    else if (key) socket.to(`chunk:${key}`).emit(Event.ENTITY_DESTROY, entity.id);
  },

  spot: (data: Spot, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(data.entityId);
    if (!key || !world.chunks.isChunkActive(key)) return;

    socket.to(`chunk:${key}`).emit(Event.ENTITY_SPOTTED_PLAYER, data);
    socket.emit(Event.ENTITY_SPOTTED_PLAYER, data);
  },

  flee: (data: string, socket: Socket, world: World) => {
    const entity = world.entities.get(data);
    if (!entity) return;

    const key = world.chunks.getChunkByEntity(entity.id);

    world.chunks.removeEntity(entity.id);
    world.entities.remove(entity.id);

    if (key) socket.to(`chunk:${key}`).emit(Event.ENTITY_DESPAWN, entity.id);
    socket.emit(Event.ENTITY_DESPAWN, entity.id);
  },

  fell: (
    data: { id: string; x: number; y: number },
    socket: Socket,
    world: World,
  ) => {
    const target = world.entities.get(data.id);
    if (!target) return;

    const key = world.chunks.getChunkByEntity(target.id);

    world.chunks.removeEntity(target.id);
    world.entities.remove(target.id);

    const player = world.players.getBySocketId(socket.id);
    const party = player && world.parties.getByPlayerId(player.id);

    if (party)
      socket.to(`party:${party.id}`).emit(Event.ENTITY_DESTROY, target.id);
    else if (key)
      socket.to(`chunk:${key}`).emit(Event.ENTITY_DESTROY, target.id);

    const wood: Omit<EntityConfig, "id"> = {
      name: EntityName.WOOD,
      map: target.map,
      x: data.x,
      y: data.y,
      health: 1,
      createdAt: Date.now(),
    };

    entity.create(wood, socket, world);
  },
};
