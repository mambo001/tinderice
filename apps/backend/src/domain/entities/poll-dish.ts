import { Schema } from "effect";

import { DishId, PollId } from "../value-objects";

export class PollDish extends Schema.Class<PollDish>("PollDish")({
  pollId: PollId,
  dishId: DishId,
  dishName: Schema.String,
  imageUrl: Schema.String,
  position: Schema.Number,
}) {}
