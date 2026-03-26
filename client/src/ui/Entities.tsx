import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

interface Entity {
  id: string;
  x: number;
  y: number;
  health: number;
}

export function Entities() {
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const handler = (data: Entity[]) => {
      setEntities(data);
    };

    EventBus.on(Event.ENTITIES_UPDATE, handler);

    return () => {
      EventBus.off(Event.ENTITIES_UPDATE, handler);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-5xl h-5xl pointer-events-none">
      {entities.map((e) => (
        <span
          key={e.id}
          className="pointer-events-none absolute text-sm text-white"
          style={{ left: e.x, top: e.y }}
        >
          {e.health}
        </span>
      ))}
    </div>
  );
}
