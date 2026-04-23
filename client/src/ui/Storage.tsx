import { useEffect, useRef, useState } from "react";
import { Event, Item as ItemType } from "@server/types";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

export function Storage() {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [slots, setSlots] = useState<(ItemType | null)[]>([]);
  const ref = useRef<string | null>(null);

  useEffect(() => {
    const open = (data: { entityId: string; slots: number }) => {
      ref.current = data.entityId;

      setId(data.entityId);
      setSlots(new Array(data.slots).fill(null));
      setIsOpen(true);
    };

    const sync = (data: { entityId: string; slots: (ItemType | null)[] }) => {
      if (data.entityId === ref.current) setSlots(data.slots);
    };

    const toggle = () => {
      if (!ref.current) return;

      EventBus.emit(Event.STORAGE_CLOSE, ref.current);
      ref.current = null;

      setId(null);
      setIsOpen(false);
    };

    EventBus.on(Event.STORAGE_OPEN, open);
    EventBus.on(Event.STORAGE_SYNC, sync);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.STORAGE_OPEN, open);
      EventBus.off(Event.STORAGE_SYNC, sync);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  const withdraw = (item: ItemType) => {
    if (!id) return;
    EventBus.emit(Event.STORAGE_WITHDRAW, { entityId: id, item });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-black/25 rounded-lg p-4 self-start">
      <h3 className="text-white mb-2">Chest</h3>
      <ul className="flex flex-wrap gap-1 max-w-135">
        {slots.map((item, i) => (
          <Item
            key={i}
            name={item?.name ?? null}
            quantity={item?.quantity}
            onClick={() => item && withdraw(item)}
          />
        ))}
      </ul>
    </div>
  );
}
