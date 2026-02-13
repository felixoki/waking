import {
  DialogueChoice,
  DialogueEffect,
  DialogueEffectName,
  DialogueResponse,
} from "@server/types/dialogue";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";

export const Dialogue = () => {
  const [data, setData] = useState<DialogueResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers: Record<DialogueEffectName, (effect: DialogueEffect) => void> =
    {
      [DialogueEffectName.CONVERSATION_END]: () => {
        setIsOpen(false);
        setData(null);
      },
      [DialogueEffectName.COLLECTION_START]: () => {
        EventBus.emit("entity:collection:request", data?.entityId);
      },
      [DialogueEffectName.COLLECTION_END]: () => {},
    };

  const choose = (choice: DialogueChoice) => {
    choice.effects?.forEach((effect) => {
      const handler = handlers[effect.name];
      if (handler) handler(effect);
    });

    if (choice.next) {
      EventBus.emit("entity:dialogue:choice", {
        entityId: data?.entityId,
        nodeId: choice.next,
      });
    }
  };

  useEffect(() => {
    const handler = (response: DialogueResponse) => {
      setData(response);
      setIsOpen(true);
    };

    EventBus.on("entity:dialogue:start", handler);

    return () => {
      EventBus.off("entity:dialogue:start", handler);
    };
  }, []);

  if (!isOpen || !data) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg max-w-135 bg-gray-200 p-4">
      <p>{data.text as string}</p>
      <ul className="flex flex-col gap-2">
        {data.choices.map((choice, i) => (
          <li key={i}>
            <button
              className="rounded bg-gray-300 px-2 py-1 hover:bg-gray-400"
              onClick={() => choose(choice)}
            >
              {choice.text as string}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
