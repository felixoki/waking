import { Instance } from "../Instance";

export class InstanceManager {
  private instances = new Map<string, Instance>();
  private connections = new Map<string, string>();

  create(host: string): Instance {
    const id = crypto.randomUUID();
    const instance = new Instance(id, host);
    this.instances.set(id, instance);
    return instance;
  }

  get(id: string): Instance | undefined {
    return this.instances.get(id);
  }

  getBySocketId(socketId: string): Instance | undefined {
    const instanceId = this.connections.get(socketId);
    if (!instanceId) return undefined;
    return this.instances.get(instanceId);
  }

  setConnection(socketId: string, instanceId: string): void {
    this.connections.set(socketId, instanceId);
  }

  remove(id: string): boolean {
    return this.instances.delete(id);
  }

  removeConnection(socketId: string): boolean {
    return this.connections.delete(socketId);
  }

  list(): string[] {
    return [...this.instances.values()].map((instance) => instance.id);
  }
}
