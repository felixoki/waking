import { Game } from "../Game";

export enum Mood {
  HUNGRY = "HUNGRY",
  HAPPY = "HAPPY",
}

export enum NodeId {
  GREETING = "greeting",
}

export enum ChoiceId {
  GOODBYE = "goodbye",
}

export type DialogueText = string | string[] | Record<Mood, string | string[]>;

export interface DialogueReference {
  ref: NodeId | ChoiceId;
}

export interface DialogueChoice {
  text: DialogueText;
  next?: string;
  effects?: DialogueEffect[];
}

export interface DialogueEffect {
  type: "conversation:end";
  params?: Record<string, any>;
}

export interface DialogueNode {
  text: DialogueText;
  choices?: Array<DialogueChoice | DialogueReference>;
  salience?: number;
}

export interface Dialogue {
  [nodeId: string]: DialogueNode | DialogueNode[] | DialogueReference;
}

export interface DialogueContext {
  game: Game;
  playerId: string;
  entityId: string;
}

export interface DialogueResponse {
  entityId: string;
  nodeId: string;
  text: DialogueText;
  choices: DialogueChoice[];
}