import { StateName } from "@server/types";

export const state = {
  resolve: () => {
    // Conditional map for state resolutions
    // const selectors = [];

    return {
      state: StateName.IDLE,
      needsUpdate: false,
    };
  },
};
