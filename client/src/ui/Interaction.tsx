import { useEffect, useState } from "react";
import EventBus from "../game/EventBus";
import { VendorConfig } from "@server/types";

interface Interaction {
  id: string;
  vendor?: {
    config: VendorConfig;
  };
}

export const Interaction = () => {
  const [data, setData] = useState<Interaction | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (data: Interaction) => {
      setData(data);
      setIsOpen(true);
    };

    EventBus.on("interaction:start", handler);

    return () => {
      EventBus.off("interaction:start", handler);
    };
  }, []);

  if (!isOpen || !data?.id) return null;

  return (
    <div>
      <h3>Interaction with {data.id}</h3>
      {data.vendor && (
        <div>
          <h4>Vendor</h4>
          <p>
            This entity is a vendor for: {data.vendor.config.accepts.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};
