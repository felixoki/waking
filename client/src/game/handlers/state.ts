import { Direction, PlayerInput, StateName } from "@server/types";

export const state = {
  resolve: (
    input: PlayerInput,
    prev: { state: StateName; direction: Direction }
  ) => {
    const selectors = [
      {
        condition: () => input.direction,
        state: () => StateName.WALKING,
      },
      {
        condition: () => true,
        state: () => StateName.IDLE,
      },
    ];

    const selector = selectors.find((s) => s.condition());

    const changed = {
      state: selector?.state() !== prev.state,
      direction: !!input.direction && input.direction !== prev.direction,
    };

    return {
      state: selector!.state(),
      needsUpdate: !changed.state && changed.direction,
    };
  },
};
