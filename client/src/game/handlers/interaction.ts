import { ComponentName } from "@server/types";
import { VendorComponent } from "../components/Vendor";
import { Entity } from "../Entity";
import EventBus from "../EventBus";

export const interaction = {
  start(entity: Entity) {
    console.log("Interacting with entity:", entity);
    const isVendor = entity.getComponent<VendorComponent>(ComponentName.VENDOR);

    EventBus.emit("interaction:start", {
      id: entity.id,
      ...(isVendor && {
        vendor: {
          config: isVendor.config,
        },
      }),
    });
  },
};
