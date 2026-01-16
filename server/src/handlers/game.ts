import { Socket } from "socket.io";
import { InstanceManager } from "../managers/Instance";
import { MapName } from "../types";

export const game = {
  create: (socket: Socket, instances: InstanceManager) => {
    const instance = instances.create(socket.id);

    instances.setConnection(socket.id, instance.id);
    socket.join(`game:${instance.id}:${MapName.VILLAGE}`);
    socket.emit("game:create", { instanceId: instance.id });
  },

  join: (socket: Socket, instances: InstanceManager, instanceId: string) => {
    const instance = instances.get(instanceId);

    if (!instance) return;

    instances.setConnection(socket.id, instanceId);
    socket.join(`game:${instance.id}:${MapName.VILLAGE}`);
    socket.emit("game:join", { instanceId: instance.id });
  },

  list: (socket: Socket, instances: InstanceManager) => {
    const ids = instances.list();
    socket.emit("game:list", ids);
  },
};
