import { useEffect, useState } from "react";
import { Event, Item } from "@server/types";
import EventBus from "../game/EventBus";

export function Inventory() {
  const [items, setItems] = useState<(Item | null)[]>(Array(20).fill(null));

  useEffect(() => {
    const add = (items: (Item | null)[]) => {
      setItems(items);
    };

    EventBus.on(Event.INVENTORY_UPDATE, add);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, add);
    };
  }, []);

  return (
    <>
      <ul className="flex flex-wrap gap-1 max-w-135">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
          >
            {item?.quantity} {item?.name}
          </li>
        ))}
      </ul>
    </>
  );
}
