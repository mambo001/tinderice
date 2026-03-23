import { Schema } from "effect";

import { RoomId, UserId } from "../value-objects";

export class Room extends Schema.Class<Room>("Room")({
  id: RoomId,
  ownerId: UserId,
  name: Schema.String,
  members: Schema.Array(UserId),
  createdAt: Schema.DateFromNumber,
}) {}
