import { Schema } from "effect";

import { DishId, UserId, DishTag, RecipeId } from "../value-objects";

export class Dish extends Schema.Class<Dish>("Dish")({
  id: DishId,
  name: Schema.String,
  imageUrl: Schema.String,
  tags: Schema.Array(DishTag),
  recipes: Schema.Array(RecipeId),
  createdAt: Schema.DateFromNumber,
  createdBy: UserId,
  updatedAt: Schema.NullishOr(Schema.DateFromNumber),
  updatedBy: Schema.NullishOr(UserId),
}) {}
