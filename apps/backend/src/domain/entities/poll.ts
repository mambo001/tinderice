import { Schema } from "effect";

import { DishId, PollId, UserId } from "../value-objects";

export class Poll extends Schema.Class<Poll>("Poll")({
  id: PollId,
  ownerId: UserId,
  title: Schema.String,
  participants: Schema.Array(UserId),
  winnerDishId: Schema.NullishOr(DishId),
  startedAt: Schema.DateFromNumber,
  endedAt: Schema.NullishOr(Schema.DateFromNumber),
  isActive: Schema.Boolean,
}) {}
