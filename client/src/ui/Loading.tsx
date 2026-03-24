import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";

export function Loading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const show = () => setLoading(true);
    const hide = () => setLoading(false);

    EventBus.on("party:start:request", show);
    EventBus.on("party:start:ready", hide);

    return () => {
      EventBus.off("party:start:request", show);
      EventBus.off("party:start:ready", hide);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <p className="text-white text-2xl animate-pulse">Loading...</p>
    </div>
  );
}
