import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError } from "@/domain/errors";
import { RoomRepository } from "@/domain/ports";
import { RoomId, UserId } from "@/domain/value-objects";

const TouchRoomPresenceInput = Schema.Struct({
  roomId: RoomId,
  userId: UserId,
});

type TouchRoomPresenceInput = typeof TouchRoomPresenceInput.Type;

export function touchRoomPresence(
  input: TouchRoomPresenceInput,
): Effect.Effect<void, DatabaseError | ParseResult.ParseError, RoomRepository> {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    yield* repo.touchPresence(input.roomId, input.userId, new Date());
  });
}
