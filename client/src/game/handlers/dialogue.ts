import { DialogueResponse, Event } from "@server/types";
import EventBus from "../EventBus";

export const dialogue = {
  start: (data: DialogueResponse) => {
    EventBus.emit(Event.ENTITY_DIALOGUE_START, data);
  },
};
