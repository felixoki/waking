import { useEffect, useState } from "react";
import { InventoryItem } from "@server/types";
import EventBus from "../game/EventBus";

export function Inventory() {
  const [items, setItems] = useState<(InventoryItem | null)[]>(
    Array(20).fill(null)
  );

  useEffect(() => {
    const add = (items: (InventoryItem | null)[]) => {
      setItems(items);
    };

    EventBus.on("inventory:update", add);

    return () => {
      EventBus.off("inventory:update", add);
    };
  }, []);

  return (
    <>
      <h3>Inventory</h3>
      <ul>
        {items.map((item, i) => (
          <li
            key={i}
            className="border border-slate-200 rounded p-2 my-2 text-xs"
          >
            {item?.name} {item?.quantity}
          </li>
        ))}
      </ul>
    </>
  );
}
