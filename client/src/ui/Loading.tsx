import { useEffect, useRef, useState } from "react";
import EventBus from "../game/EventBus";
import { Event } from "@server/types";

type Phase = "hidden" | "fade-in" | "visible" | "fade-out";

const FADE_MS = 300;
const TIP_MS = 10_000;

const tips = [
  "Shadow wanderers will only strike if you attack first.",
  "If you die or leave your party in the realm, you lose your inventory.",
  "Look for nearby caves if you come across trolls. They often stash treasure there.",
  "The herbalist can help you reach deeper dream levels with potions."
];

function randomTip(exclude?: string) {
  const pool = tips.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function Loading() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [showTips, setShowTips] = useState(false);
  const [tip, setTip] = useState(randomTip);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const show = (withTips?: boolean) => {
      setShowTips(withTips === true);
      if (withTips) setTip(randomTip());
      setPhase((p) => (p === "visible" || p === "fade-in" ? p : "fade-in"));
    };

    const hide = () => setPhase("fade-out");

    EventBus.on(Event.TRANSITION_START, show);
    EventBus.on(Event.TRANSITION_END, hide);

    return () => {
      EventBus.off(Event.TRANSITION_START, show);
      EventBus.off(Event.TRANSITION_END, hide);
    };
  }, []);

  useEffect(() => {
    clearInterval(interval.current);

    if (showTips && (phase === "fade-in" || phase === "visible"))
      interval.current = setInterval(() => setTip(randomTip), TIP_MS);

    return () => clearInterval(interval.current);
  }, [showTips, phase]);

  const onTransitionEnd = () => {
    if (phase === "fade-in") {
      setPhase("visible");
      EventBus.emit(Event.TRANSITION_LOAD);
    }
    if (phase === "fade-out") setPhase("hidden");
  };

  const visible = phase === "fade-in" || phase === "visible";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: phase === "hidden" ? "none" : "auto",
      }}
      onTransitionEnd={onTransitionEnd}
    >
      {showTips && visible && <p className="text-white text-2xl animate-pulse">{tip}</p>}
    </div>
  );
}
