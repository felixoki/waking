import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import {
  Direction,
  Event,
  Input,
  MapName,
  PlayerConfig,
  Transition,
} from "../types/index.js";
import { configs } from "../configs/index.js";
import { World } from "../World.js";
import { party } from "./party.js";
import { handlers } from "./index.js";

export const player = {
  create: (socket: Socket, world: World) => {
    let player = world.players.getBySocketId(socket.id);

    if (!player) {
      const map = configs.maps[MapName.VILLAGE];
      const isAuthority = !world.getAuthority(map.id);

      player = {
        x: map.spawn.x,
        y: map.spawn.y,
        facing: Direction.DOWN,
        id: randomUUID(),
        socketId: socket.id,
        map: map.id,
        health: 100,
        mana: 100000,
        isAuthority,
        isDead: false,
      };

      world.players.add(player.id, player);
      socket.join(`map:${player.map}`);

      if (isAuthority) world.setAuthority(player.map, player.id);
    }

    socket.emit(Event.PLAYER_CREATE_LOCAL, player);
    socket.emit(
      Event.PLAYER_CREATE_OTHERS,
      world.players.getOthersOnMap(player.id, player.map),
    );

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      player.x,
      player.y,
    );

    socket.to(`map:${player.map}`).emit(Event.PLAYER_CREATE, player);
    socket.emit(Event.PARTY_LIST, world.parties.getLobbies());
    socket.emit(Event.WORLD_TIME, world.getTime());
    socket.emit(Event.ECONOMY_UPDATE, world.economy.getSnapshot());
  },

  delete: (io: Server, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player) return;

    party.leave(socket, io, world);

    const keys = handlers.chunks.clear(socket, world, player.id);
    keys.forEach((key) => {
      socket.to(`chunk:${key}`).emit(Event.PLAYER_LEAVE, player.id);
    });

    const wasAuthority = world.getAuthority(player.map) === player.id;
    world.players.remove(player.id);

    if (wasAuthority) {
      const nextId = world.transferAuthority(player.map, player.id);

      if (nextId) {
        const nextSocket = io.sockets.sockets.get(
          world.players.get(nextId)!.socketId,
        );
        nextSocket?.emit(Event.PLAYER_AUTHORITY, true);
      }
    }
  },

  input: (data: Input, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || player.isDead) return;

    world.players.update(data.id, {
      ...player,
      ...{
        x: data.x,
        y: data.y,
        state: data.state,
        ...(data.facing && { facing: data.facing }),
        isRunning: data.isRunning,
      },
    });

    const key = world.chunks.toChunkKey(player.map, data.x, data.y);
    socket.to(`chunk:${key}`).emit(Event.PLAYER_INPUT, data);

    const party = world.parties.getByPlayerId(player.id);
    if (party) socket.to(`party:${party.id}`).emit(Event.PLAYER_INPUT, data);

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      player.map,
      data.x,
      data.y,
    );
  },

  transfer: (
    socket: Socket,
    io: Server,
    world: World,
    playerId: string,
    to: MapName,
    x: number,
    y: number,
    updates?: Partial<PlayerConfig>,
    exclude?: string[],
  ) => {
    const prev = world.players.get(playerId);
    if (!prev) return;

    handlers.chunks.clear(socket, world, playerId);

    const nextId = world.transferAuthority(prev.map, playerId, exclude);
    if (nextId) {
      const nextSocket = io.sockets.sockets.get(
        world.players.get(nextId)!.socketId,
      );
      nextSocket?.emit(Event.PLAYER_AUTHORITY, true);
    }

    const isAuthority = !world.getAuthority(to);

    world.players.update(playerId, {
      map: to,
      x,
      y,
      isAuthority,
      ...updates,
    });

    if (isAuthority) world.setAuthority(to, playerId);

    socket.leave(`map:${prev.map}`);
    socket.join(`map:${to}`);
    socket.to(`map:${prev.map}`).emit(Event.PLAYER_LEAVE, playerId);

    const updated = world.players.get(playerId);
    const others = world.players.getOthersOnMap(playerId, to);

    socket.emit(Event.PLAYER_TRANSITION, updated);
    socket.emit(Event.PLAYER_CREATE_OTHERS, others);

    handlers.chunks.sync.player(socket, world, playerId, to, x, y);

    socket.to(`map:${to}`).emit(Event.PLAYER_CREATE, updated);
  },

  transition: (data: Transition, io: Server, socket: Socket, world: World) => {
    const p = world.players.getBySocketId(socket.id);
    if (!p) return;

    const prev = p.map;

    player.transfer(socket, io, world, p.id, data.to, data.x, data.y);

    const partyData = world.parties.getByPlayerId(p.id);
    if (partyData && prev === MapName.REALM)
      handlers.party.cleanup(socket, world, partyData.id);
  },

  spectate: (data: { targetId: string }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    if (!player || !player.isDead) return;

    const target = world.players.get(data.targetId);
    if (!target || target.map !== player.map) return;

    const party = world.parties.getByPlayerId(player.id);
    if (!party || !party.members.includes(target.id)) return;

    handlers.chunks.sync.player(
      socket,
      world,
      player.id,
      target.map,
      target.x,
      target.y,
    );
  },
};
