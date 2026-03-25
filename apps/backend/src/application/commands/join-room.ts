import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError, RoomNotFoundError } from "@/domain/errors";
import { RoomRepository } from "@/domain/ports";
import { RoomId, UserId } from "@/domain/value-objects";

const JoinRoomInput = Schema.Struct({
  roomId: RoomId,
  userId: UserId,
});

type JoinRoomInput = typeof JoinRoomInput.Type;

const JoinRoomOutput = Schema.Struct({
  roomId: RoomId,
  userId: UserId,
});

type JoinRoomOutput = typeof JoinRoomOutput.Type;

export function joinRoom(
  input: JoinRoomInput,
): Effect.Effect<
  JoinRoomOutput,
  DatabaseError | ParseResult.ParseError | RoomNotFoundError,
  RoomRepository
> {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;

    yield* repo.findById(input.roomId);
    yield* repo.addMember(input.roomId, input.userId);

    return {
      roomId: input.roomId,
      userId: input.userId,
    };
  });
}
