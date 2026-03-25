import { Schema } from "effect";

import { DishId, PollId, RoomId, UserId } from "../value-objects";

export class PollSummary extends Schema.Class<PollSummary>("PollSummary")({
  id: PollId,
  roomId: RoomId,
  ownerId: UserId,
  title: Schema.String,
  participantCount: Schema.Number,
  winnerDishId: Schema.NullishOr(DishId),
  winnerDishName: Schema.NullishOr(Schema.String),
  startedAt: Schema.DateFromNumber,
  deadlineAt: Schema.DateFromNumber,
  endedAt: Schema.DateFromNumber,
}) {}
