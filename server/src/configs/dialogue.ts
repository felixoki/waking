import {
  ChoiceId,
  DialogueChoice,
  DialogueNode,
  Mood,
  NodeId,
} from "../types/dialogue";

export const COMMON_CHOICES: Record<string, DialogueChoice | DialogueChoice[]> =
  {
    [ChoiceId.GOODBYE]: [
      { text: "Goodbye", effects: [{ type: "conversation:end" }] },
    ],
  };

export const COMMON_NODES: Record<string, DialogueNode[]> = {
  [NodeId.GREETING]: [
    {
      text: {
        [Mood.HUNGRY]: [
          "Hello... *looks tired*",
          "Oh, hello there...",
          "*sighs*",
        ],
        [Mood.HAPPY]: ["Hello there!", "Greetings, friend!", "Good day!"],
      },
      choices: [{ ref: ChoiceId.GOODBYE }],
    },
  ],
};
