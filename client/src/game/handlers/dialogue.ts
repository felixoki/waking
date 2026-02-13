import { DialogueResponse } from "@server/types";
import EventBus from "../EventBus";

export const dialogue = {
  start: (data: DialogueResponse) => {
    EventBus.emit("entity:dialogue:start", data);
  },
};
