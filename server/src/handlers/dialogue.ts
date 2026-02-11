import { Socket } from "socket.io";
import { definitions } from "../configs/definitions";
import { COMMON_CHOICES, COMMON_NODES } from "../configs/dialogue";
import { Game } from "../Game";
import { NeedName } from "../types";
import {
  DialogueChoice,
  DialogueContext,
  DialogueNode,
  DialogueReference,
  DialogueText,
  Mood,
  NodeId,
} from "../types/dialogue";

export const dialogue = {
  getMood: (context: DialogueContext): Mood => {
    if (context.game.economy.isLow(NeedName.MEAT)) return Mood.HUNGRY;
    return Mood.HAPPY;
  },

  resolve: {
    text: (text: DialogueText, mood: Mood): string => {
      if (typeof text === "string") return text;

      if (Array.isArray(text))
        return text[Math.floor(Math.random() * text.length)];

      const selected = text[mood] || text[Mood.HAPPY];

      if (Array.isArray(selected))
        return selected[Math.floor(Math.random() * selected.length)];

      return selected;
    },

    choice: (
      choice: DialogueChoice | DialogueReference,
    ): DialogueChoice | null => {
      if ("ref" in choice) {
        let common = COMMON_CHOICES[choice.ref as keyof typeof COMMON_CHOICES];

        if (!common) return null;

        if (Array.isArray(common))
          common = common[Math.floor(Math.random() * common.length)];

        return common;
      }

      return choice;
    },

    node: (
      node: DialogueNode | DialogueNode[] | DialogueReference,
    ): DialogueNode | null => {
      if ("ref" in node) {
        const common = COMMON_NODES[node.ref as keyof typeof COMMON_NODES];
        if (!common || !common.length) return null;

        return common[Math.floor(Math.random() * common.length)];
      }

      if (Array.isArray(node)) {
        const sorted = [...node].sort(
          (a, b) => (b.salience || 0) - (a.salience || 0),
        );
        return sorted[0];
      }

      return node;
    },
  },

  interact: (entityId: string, socket: Socket, game: Game, nodeId: NodeId) => {
    const entity = game.entities.get(entityId);
    if (!entity) return;

    const definition = definitions[entity.name];
    if (!definition) return;

    const player = game.players.getBySocketId(socket.id);
    if (!player) return;

    const context: DialogueContext = {
      game,
      playerId: player.id,
      entityId,
    };

    const mood = dialogue.getMood(context);

    const def = definition.dialogue?.[nodeId];
    if (!def) return;

    const node = dialogue.resolve.node(def);
    if (!node) return;

    const text = dialogue.resolve.text(node.text, mood);

    const choices = (node.choices || [])
      .map((choice) => dialogue.resolve.choice(choice))
      .filter((choice) => choice !== null)
      .map((choice) => ({
        text: choice!.text,
        next: choice!.next,
        effects: choice!.effects,
      }));

    socket.emit("entity:interact:response", {
      entityId,
      nodeId,
      text,
      choices,
    });
  },
};
