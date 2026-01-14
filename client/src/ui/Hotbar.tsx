import { HotbarSlot } from "@server/types";
import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";

export function Hotbar() {
  const [slots, setSlots] = useState<(HotbarSlot | null)[]>(() =>
    Array(8).fill(null)
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

    EventBus.on("hotbar:update", handler);

    return () => {
      EventBus.off("hotbar:update", handler);
    };
  }, []);

  return (
    <>
      <h3>Hotbar</h3>
      {slots.map((slot, i) => (
        <div
          key={i}
          className={`border rounded p-2 my-2 text-xs ${
            i === active ? "border-blue-600" : "border-slate-200"
          }`}
        >
          {slot?.name}
        </div>
      ))}
    </>
  );
}
