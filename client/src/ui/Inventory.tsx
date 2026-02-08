import { useEffect, useState } from "react";
import { Item } from "@server/types";
import EventBus from "../game/EventBus";

export function Inventory() {
  const [items, setItems] = useState<(Item | null)[]>(Array(20).fill(null));

  useEffect(() => {
    const add = (items: (Item | null)[]) => {
      setItems(items);
    };

    EventBus.on("inventory:update", add);

    return () => {
      EventBus.off("inventory:update", add);
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
