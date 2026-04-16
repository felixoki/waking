import { ComponentName, EntityName, Event, Item } from "@server/types";
import { Component } from "./Component";
import EventBus from "../EventBus";
import { configs } from "@server/configs";
import { MAX_STACK } from "@server/globals";

export class InventoryComponent extends Component {
  private items: (Item | null)[] = new Array(20).fill(null);

  public name = ComponentName.INVENTORY;

  attach(): void {}
  update(): void {}
  detach(): void {}

  add(name: EntityName, quantity: number = 1): boolean {
    const def = configs.entities[name];

    if (!def || !def.metadata) return false;

    if (def.metadata.stackable) {
      const existing = this.items.findIndex(
        (item) => item?.name === name && item.stackable && item.quantity < MAX_STACK,
      );

      if (existing !== -1) {
        this.items[existing]!.quantity += quantity;

        this.emit();
        return true;
      }
    }

    const empty = this.items.findIndex((item) => item === null);

    if (empty !== -1) {
      this.items[empty] = {
        name,
        quantity,
        stackable: def.metadata.stackable || false,
      };

      this.emit();
      return true;
    }

    return false;
  }

  remove(name: EntityName, quantity: number = 1): boolean {
    const index = this.items.findIndex((item) => item?.name === name);

    if (index !== -1 && this.items[index]) {
      if (this.items[index]!.quantity > quantity)
        this.items[index]!.quantity -= quantity;
      else this.items[index] = null;

      this.emit();
      return true;
    }

    return false;
  }

  get(): (Item | null)[] {
    return this.items;
  }

  set(items: (Item | null)[]): void {
    this.items = items;
    this.emit();
  }

  emit(): void {
    EventBus.emit(Event.INVENTORY_UPDATE, [...this.items]);
  }
}
