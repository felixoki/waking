import { Server, Socket } from "socket.io";
import { handlers } from "../handlers/index.js";
import { tryCatch } from "../utils/tryCatch.js";
import {
  Input,
  Hit,
  EntityPickup,
  Item,
  Transition,
  Spot,
} from "../types/index.js";
import { Game } from "../Game.js";
import { NodeId } from "../types/dialogue.js";

type SocketEvent = {
  event: string;
  handler: (...args: any[]) => void | Promise<void>;
};

export function registerHandlers(io: Server, socket: Socket, game: Game) {
  const events: SocketEvent[] = [
    /**
     * Player
     */
    {
      event: "player:create",
      handler: () => handlers.player.create(socket, game),
    },
    {
      event: "disconnect",
      handler: () => handlers.player.delete(io, socket, game),
    },
    {
      event: "player:input",
      handler: (data: Input) => handlers.player.input(data, socket, game),
    },
    {
      event: "player:transition",
      handler: (data: Transition) =>
        handlers.player.transition(data, socket, game),
    },
    /**
     * Entity
     */
    {
      event: "entity:create",
      handler: () => handlers.entity.create(socket, game),
    },
    {
      event: "entity:input",
      handler: (data: Partial<Input>) =>
        handlers.entity.input(data, socket, game),
    },
    {
      event: "entity:pickup",
      handler: (data: EntityPickup) =>
        handlers.entity.pickup(data, socket, game),
    },
    {
      event: "entity:spotted:player",
      handler: (data: Spot) =>
        console.log(`Entity ${data.entityId} spotted player ${data.playerId}`),
    },
    {
      event: "entity:dialogue:iterate",
      handler: (data: { entityId: string; nodeId: NodeId }) =>
        handlers.dialogue.iterate(data.entityId, socket, game, data.nodeId),
    },
    /**
     * Items
     */
    {
      event: "item:collect",
      handler: (data: Item) => handlers.item.collect(data, socket, game),
    },
    /**
     * Shared
     */
    {
      event: "hit",
      handler: (data: Hit) => handlers.combat.hit(data, socket, game),
    },
  ];

  events.forEach(({ event, handler }) => {
    socket.on(event, async (...args) => {
      const { data, error } = await tryCatch(Promise.resolve(handler(...args)));

      if (error)
        throw new Error(`Error handling event "${event}": ${error.message}`);

      return data;
    });
  });
}
