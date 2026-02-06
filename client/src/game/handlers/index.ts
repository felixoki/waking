import { combat } from "./combat";
import { direction } from "./direction";
import { interaction } from "./interaction";
import { move } from "./move";
import { path } from "./path";
import { physics } from "./physics";
import { spells } from "./spells";
import { state } from "./state";
import { vision } from "./vision";
import { weapons } from "./weapons";

export const handlers = {
  state,
  move,
  direction,
  physics,
  combat,
  spells,
  weapons,
  interaction,
  vision,
  path
};
