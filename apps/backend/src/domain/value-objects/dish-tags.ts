import { Schema } from "effect";

export const dishTags = {
  spicy: "spicy",
  vegan: "vegan",
  vegetarian: "vegetarian",
  glutenFree: "glutenFree",
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
  dessert: "dessert",
} as const;

export const DishTag = Schema.Literal(...Object.values(dishTags));
export type DishTag = (typeof dishTags)[keyof typeof dishTags];
