import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError, RoomNotFoundError } from "@/domain/errors";
import { PollRepository, RoomRepository } from "@/domain/ports";
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
  RoomRepository | PollRepository
> {
  return Effect.gen(function* () {
    const roomRepo = yield* RoomRepository;
    const pollRepo = yield* PollRepository;

    yield* roomRepo.findById(input.roomId);
    yield* roomRepo.addMember(input.roomId, input.userId);

    const polls = yield* pollRepo.findByRoomId(input.roomId);

    yield* Effect.forEach(
      polls.filter((poll) => poll.isActive),
      (poll) => pollRepo.addParticipant(poll.id, input.userId),
      { concurrency: "unbounded" },
    );

    return {
      roomId: input.roomId,
      userId: input.userId,
    };
  });
}
