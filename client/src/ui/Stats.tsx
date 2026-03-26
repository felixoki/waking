import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

export function Stats() {
  const [health, setHealth] = useState(100);
  const [mana, setMana] = useState(100);

  useEffect(() => {
    EventBus.on(Event.PLAYER_HEALTH, setHealth);
    EventBus.on(Event.PLAYER_MANA, setMana);

    return () => {
      EventBus.off(Event.PLAYER_HEALTH, setHealth);
      EventBus.off(Event.PLAYER_MANA, setMana);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 p-4 text-white text-sm font-mono flex flex-col gap-1">
      <span>Health: {health}</span>
      <span>Mana: {mana}</span>
    </div>
  );
}
