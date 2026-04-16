import { Socket } from "socket.io";
import { MAX_STACK } from "../globals";
import { ComponentName, Item, Event } from "../types";
import { configs } from "../configs/index.js";
import { World } from "../World";

export const storage = {
  add(slots: (Item | null)[], item: Item): (Item | null)[] {
    const result = storage.clone(slots);
    let remaining = item.quantity;

    if (item.stackable)
      for (const s of result) {
        if (s?.name !== item.name || s.quantity >= MAX_STACK) continue;
        const add = Math.min(MAX_STACK - s.quantity, remaining);

        s.quantity += add;
        remaining -= add;
        if (remaining === 0) return result;
      }

    const empty = result.findIndex((s) => s === null);
    
    if (remaining > 0 && empty !== -1)
      result[empty] = { ...item, quantity: remaining };

    return result;
  },

  remove(slots: (Item | null)[], item: Item): (Item | null)[] {
    const result = storage.clone(slots);
    let remaining = item.quantity;

    for (let i = 0; i < result.length && remaining > 0; i++) {
      if (result[i]?.name !== item.name) continue;
      const remove = Math.min(result[i]!.quantity, remaining);

      result[i]!.quantity -= remove;
      remaining -= remove;
      if (result[i]!.quantity === 0) result[i] = null;
    }

    return result;
  },

  has(slots: (Item | null)[], item: Item): boolean {
    const total = slots
      .filter((s): s is Item => s?.name === item.name)
      .reduce((sum, s) => sum + s.quantity, 0);

    return total >= item.quantity;
  },

  clone(slots: (Item | null)[]) {
    return slots.map((s) => (s ? { ...s } : null));
  },

  open: (data: { entityId: string }, socket: Socket, world: World) => {
    const player = world.players.getBySocketId(socket.id);
    const entity = world.entities.get(data.entityId);

    if (!entity || entity.isLocked || !player) return;

    if (!entity.storing) {
      const def = configs.entities[entity.name];
      const comp = def?.components.find((c) => c.name === ComponentName.STORAGE);
      const slots = comp && comp.name === ComponentName.STORAGE ? comp.config.slots : 16;
      entity.storing = new Array(slots).fill(null);
    }

    entity.isLocked = true;
    entity.lockedBy = player.id;

    socket.emit(Event.STORAGE_SYNC, {
      entityId: data.entityId,
      slots: entity.storing,
    });
  },

  close: (data: { entityId: string }, socket: Socket, world: World) => {
    const entity = world.entities.get(data.entityId);
    const player = world.players.getBySocketId(socket.id);

    if (!entity || !player || entity.lockedBy !== player.id) return;

    entity.isLocked = false;
    entity.lockedBy = undefined;
  },

  deposit: (
    data: { entityId: string; item: Item },
    socket: Socket,
    world: World,
  ) => {
    const entity = world.entities.get(data.entityId);
    const player = world.players.getBySocketId(socket.id);

    if (!entity || !player || entity.lockedBy !== player.id) return;
    if (!storage.has(player.inventory, data.item)) return;

    player.inventory = storage.remove(player.inventory, data.item);
    entity.storing = storage.add(entity.storing ?? [], data.item);

    socket.emit(Event.STORAGE_SYNC, { entityId: data.entityId, slots: entity.storing });
    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },

  withdraw: (
    data: { entityId: string; item: Item },
    socket: Socket,
    world: World,
  ) => {
    const entity = world.entities.get(data.entityId);
    const player = world.players.getBySocketId(socket.id);

    if (!entity || !player || entity.lockedBy !== player.id) return;
    if (!storage.has(entity.storing ?? [], data.item)) return;

    entity.storing = storage.remove(entity.storing ?? [], data.item);
    player.inventory = storage.add(player.inventory, data.item);

    socket.emit(Event.STORAGE_SYNC, { entityId: data.entityId, slots: entity.storing });
    socket.emit(Event.INVENTORY_SYNC, player.inventory);
  },
};
