import { Schema } from "effect";

import { DishId, PollId, PollReaction, UserId } from "../value-objects";

export class PollResponse extends Schema.Class<PollResponse>("PollResponse")({
  pollId: PollId,
  dishId: DishId,
  userId: UserId,
  reaction: PollReaction,
  respondedAt: Schema.DateFromNumber,
}) {}
