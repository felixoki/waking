import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

export function Economy() {
  const [needs, setNeeds] = useState<Record<string, number>>({});

  useEffect(() => {
    const handler = (data: Record<string, number>) => {
      setNeeds(data);
    };

    EventBus.on(Event.ECONOMY_UPDATE, handler);

    return () => {
      EventBus.off(Event.ECONOMY_UPDATE, handler);
    };
  }, []);

  const entries = Object.entries(needs);
  if (!entries.length) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 text-white text-sm font-mono flex flex-col gap-1 text-right">
      {entries.map(([name, supply]) => (
        <span key={name}>
          {name}: {supply}
        </span>
      ))}
    </div>
  );
}
