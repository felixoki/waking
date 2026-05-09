import { Party, PartyStatus } from "../types";

export class PartyStore {
  private parties: Map<string, Party> = new Map();
  private byPlayerId: Map<string, string> = new Map();

  add(id: string, party: Party) {
    this.parties.set(id, party);
    for (const member of party.members) this.byPlayerId.set(member, id);
  }

  get(id: string): Party | undefined {
    return this.parties.get(id);
  }

  remove(id: string) {
    const party = this.parties.get(id);
    if (party) for (const member of party.members) this.byPlayerId.delete(member);
    this.parties.delete(id);
  }

  get all(): Party[] {
    return [...this.parties.values()];
  }

  getByPlayerId(id: string): Party | undefined {
    const partyId = this.byPlayerId.get(id);
    return partyId ? this.parties.get(partyId) : undefined;
  }

  addMember(partyId: string, playerId: string): void {
    const party = this.parties.get(partyId);
    if (!party) return;

    party.members.push(playerId);
    this.byPlayerId.set(playerId, partyId);
  }

  removeMember(partyId: string, playerId: string): void {
    const party = this.parties.get(partyId);
    if (!party) return;
    
    party.members = party.members.filter((id) => id !== playerId);
    this.byPlayerId.delete(playerId);
  }

  getLobbies(): Party[] {
    return this.all.filter((p) => p.status === PartyStatus.LOBBY);
  }
}
