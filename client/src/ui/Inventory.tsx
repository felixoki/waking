import { useEffect, useState } from "react";
import { Event, Item as ItemInterface } from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";

export function Inventory() {
  const [items, setItems] = useState<(ItemInterface | null)[]>(
    Array(24).fill(null),
  );  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const add = (items: (ItemInterface | null)[]) => setItems(items);

    const toggle = () => setIsOpen((prev) => !prev);

    EventBus.on(Event.INVENTORY_UPDATE, add);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, add);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <ul className="flex flex-wrap gap-1 mt-2 max-w-135">
      {items.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </ul>
  );
}

function Item({ item }: { item: ItemInterface | null }) {
  const config = item ? configs.entities[item.name] : null;

  return (
    <li>
      <button
        title={config?.metadata?.description || item?.name || ""}
        className="relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
      >
        {config?.metadata?.displayName || item?.name || ""}
        <span className="absolute bottom-1 right-1">{item?.quantity}</span>
      </button>
    </li>
  );
}
