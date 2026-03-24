import { animals } from "./animals";
import { buildings } from "./buildings";
import { creatures } from "./creatures";
import { crops } from "./crops";
import { crystals } from "./crystals";
import { flora } from "./flora";
import { food } from "./food";
import { ingredients } from "./ingredients";
import { interior } from "./interior";
import { people } from "./people";
import { rocks } from "./rocks";
import { transitions } from "./transitions";

export const entities = {
  ...animals,
  ...buildings,
  ...creatures,
  ...crops,
  ...crystals,
  ...flora,
  ...food,
  ...ingredients,
  ...people,
  ...rocks,
  ...transitions,
  ...interior,
};
