import { Schema } from "effect";

export const RoomId = Schema.UUID.pipe(Schema.brand("RoomId"));

export type RoomId = typeof RoomId.Type;

export const makeRoomId = Schema.decodeUnknownSync(RoomId);
