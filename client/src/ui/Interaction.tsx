import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Item } from "@server/types";
import { definitions } from "@server/configs/definitions";
import { DialogueChoice, DialogueText } from "@server/types/dialogue";

interface Interaction {
  id: string;
  collects?: Item[];
  text: DialogueText;
  choices: DialogueChoice[];
}

export const Interaction = () => {
  const [data, setData] = useState<Interaction | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const give = (item: Item) => {
    const items = data?.collects?.filter((i) => i.name !== item.name) || [];
    setData({ ...data!, collects: items });
    EventBus.emit("item:collect", item);
  };

  useEffect(() => {
    const handler = (data: Interaction) => {
      setData(data);
      setIsOpen(true);
    };

    EventBus.on("interaction:start", handler);

    return () => {
      EventBus.off("interaction:start", handler);
    };
  }, []);

  if (!isOpen || !data?.id) return null;

  return (
    <div>
      <div className="rounded-lg text-xs bg-gray-200 p-3">
        <p className="mb-2">{data.text as string}</p>
        <ul>
          {data.choices.map((choice) => (
            <li>{choice.text as string}</li>
          ))}
        </ul>
      </div>
      {data.collects && (
        <ul className="flex flex-wrap gap-1">
          {data.collects.map((item, i) => (
            <li key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200">
                {item?.quantity}{" "}
                {definitions[item?.name]?.metadata?.displayName}
              </div>
              <button
                className="p-0.5 bg-blue-500 text-white rounded"
                onClick={() => give(item)}
              >
                Give
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
