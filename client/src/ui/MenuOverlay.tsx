import { X } from "lucide-react";

interface Props {
  closing: boolean;
  onClose: () => void;
  onExited: () => void;
  children: React.ReactNode;
}

export function MenuOverlay({ closing, onClose, onExited, children }: Props) {
  return (
    <div
      className={`fixed inset-0 bg-black/85 ${
        closing
          ? "animate-[shrink_0.2s_ease-in_forwards]"
          : "animate-[grow_0.2s_ease-out]"
      }`}
      onAnimationEnd={() => {
        if (closing) onExited();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
      {children}
    </div>
  );
}
