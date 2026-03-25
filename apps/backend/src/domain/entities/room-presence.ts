import { Schema } from "effect";

import { RoomId, UserId } from "../value-objects";

export class RoomPresence extends Schema.Class<RoomPresence>("RoomPresence")({
  roomId: RoomId,
  userId: UserId,
  lastSeenAt: Schema.DateFromNumber,
}) {}
