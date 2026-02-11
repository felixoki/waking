import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { Direction, Input, MapName, Transition } from "../types/index.js";
import { configs } from "../configs/index.js";
import { Game } from "../Game.js";

export const player = {
  create: (socket: Socket, game: Game) => {
    const players = game.players;
    const entities = game.entities;

    let player = players.getBySocketId(socket.id);

    if (!player) {
      const isHost = !players.getAll().length;
      const map = configs.maps[MapName.VILLAGE];

      player = {
        x: map.spawn.x,
        y: map.spawn.y,
        facing: Direction.DOWN,
        id: randomUUID(),
        socketId: socket.id,
        map: map.id,
        health: 100,
        isHost,
      };

      players.add(player.id, player);
      socket.join(`map:${player.map}`);
    }

    const others = players
      .getByMap(player.map)
      .filter((p) => p.id !== player.id);

    socket.emit("player:create:local", player);
    socket.emit("player:create:others", others);
    socket.emit("entity:create:all", entities.getAll());

    socket.to(`map:${player.map}`).emit("player:create", player);
  },

  delete: (io: Server, socket: Socket, game: Game) => {
    const player = game.players.getBySocketId(socket.id);
    if (!player) return;

    const isHost = player.isHost;
    game.players.remove(player.id);
    const others = game.players.getAll();

    if (isHost && others.length) {
      const host = others[0];
      game.players.update(host.id, { ...host, isHost: true });

      const hostSocket = io.sockets.sockets.get(host.socketId);
      hostSocket?.emit("player:host:transfer");
    }

    socket.broadcast.emit("player:left", { id: player.id });
  },

  input: (data: Input, socket: Socket, game: Game) => {
    const player = game.players.getBySocketId(socket.id);
    if (!player) return;

    game.players.update(data.id, {
      ...player,
      ...{
        x: data.x,
        y: data.y,
        state: data.state,
        ...(data.facing && { facing: data.facing }),
        isRunning: data.isRunning,
      },
    });
    socket.broadcast.emit("player:input", data);
  },

  transition: (data: Transition, socket: Socket, game: Game) => {
    const player = game.players.getBySocketId(socket.id);
    if (!player) return;

    const prev = player.map;
    const next = data.to;

    game.players.update(player.id, {
      ...player,
      map: next,
      x: data.x,
      y: data.y,
    });

    socket.leave(`map:${prev}`);
    socket.join(`map:${next}`);

    socket.to(`map:${prev}`).emit("player:left", { id: player.id });

    const updated = game.players.get(player.id);
    const others = game.players
      .getByMap(next)
      .filter((p) => p.id !== player.id);

    socket.emit("player:transition", updated);
    socket.emit("player:create:others", others);

    socket.to(`map:${next}`).emit("player:create", updated);
  },
};
