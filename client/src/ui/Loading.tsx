import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

export function Loading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const show = () => setLoading(true);
    const hide = () => setLoading(false);

    EventBus.on(Event.PARTY_START_LOADING, show);
    EventBus.on(Event.PARTY_START_READY, hide);

    return () => {
      EventBus.off(Event.PARTY_START_LOADING, show);
      EventBus.off(Event.PARTY_START_READY, hide);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <p className="text-white text-2xl animate-pulse">Loading...</p>
    </div>
  );
}
