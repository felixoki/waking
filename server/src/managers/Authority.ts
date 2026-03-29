import { MapName, PlayerConfig } from "../types";

export class AuthorityManager {
  private authorities = new Map<string, string>();

  private key(map: MapName, partyId?: string): string {
    return partyId ? `realm:${partyId}` : map;
  }

  get(map: MapName, partyId?: string): string | undefined {
    return this.authorities.get(this.key(map, partyId));
  }

  set(map: MapName, playerId: string, partyId?: string): void {
    this.authorities.set(this.key(map, partyId), playerId);
  }

  clear(map: MapName, partyId?: string): void {
    this.authorities.delete(this.key(map, partyId));
  }

  transfer(map: MapName, from: string, candidates: PlayerConfig[], partyId?: string): string | undefined {
    const k = this.key(map, partyId);
    if (this.authorities.get(k) !== from) return undefined;

    const next = candidates.find((p) => p.id !== from);

    if (next) {
      this.authorities.set(k, next.id);
      return next.id;
    }

    this.authorities.delete(k);
    return undefined;
  }
}
