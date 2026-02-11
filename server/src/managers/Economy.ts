import { needs } from "../configs/needs";
import { DAY_MS } from "../globals";
import { ItemsStore } from "../stores/Items";
import { NeedConfig, NeedName } from "../types";

export class EconomyManager {
  private needs: Map<NeedName, NeedConfig> = new Map();
  private tier: number = 1;
  private updated: number = Date.now();

  constructor(private supply: ItemsStore) {
    this._init();
  }

  private _init() {
    needs.forEach((config) => {
      this.needs.set(config.name, config);
    });
  }

  update() {
    const now = Date.now();
    const elapsed = now - this.updated;
    this.updated = now;

    const days = elapsed / DAY_MS;

    this.needs.forEach((need) => {
      const available = this.getSupply(need);

      if (available > 0) {
        const consumption = need.consumption[this.tier] * days;
        this._consume(need, consumption);
      }
    });
  }

  getSupply(need: NeedConfig): number {
    return need.items
      .filter((tier) => tier.tier <= this.tier)
      .reduce((sum, tier) => sum + this.supply.get(tier.item), 0);
  }

  private _consume(need: NeedConfig, amount: number) {
    let remaining = amount;

    const items = need.items
      .filter((item) => item.tier <= this.tier)
      .sort((a, b) => a.tier - b.tier);

    for (const item of items) {
      if (remaining <= 0) break;

      const available = this.supply.get(item.item);

      if (available > 0) {
        const consumed = Math.min(available, remaining);
        this.supply.remove(item.item, consumed);
        remaining -= consumed;
      }
    }
  }

  isLow(name: NeedName): boolean {
    const need = this.needs.get(name);
    if (!need) return false;

    const threshold = need.threshold[this.tier];
    return this.getSupply(need) < threshold * 0.3;
  }
}
