import { EntityName, Event, HotbarSlot, SpellName } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Item } from "./Item";

export function Hotbar() {
  const [slots, setSlots] = useState<(HotbarSlot | null)[]>(() =>
    Array(8).fill(null),
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handler = (state: {
      slots: (HotbarSlot | null)[];
      active: number;
    }) => {
      setSlots(state.slots);
      setActive(state.active);
    };

    EventBus.on(Event.HOTBAR_UPDATE, handler);

    return () => {
      EventBus.off(Event.HOTBAR_UPDATE, handler);
    };
  }, []);

  return (
    <ul className="flex flex-wrap gap-1">
      {slots.map((slot, i) => (
        <Item
          key={i}
          name={(slot?.name as EntityName | SpellName) || null}
          active={i === active}
        />
      ))}
    </ul>
  );
}
