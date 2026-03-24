import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError, PollNotFoundError } from "@/domain/errors";
import { PollRepository, RoomRepository } from "@/domain/ports";
import { PollId, UserId } from "@/domain/value-objects";

const JoinPollInput = Schema.Struct({
  pollId: PollId,
  userId: UserId,
});

type JoinPollInput = typeof JoinPollInput.Type;

const JoinPollOutput = Schema.Struct({
  pollId: PollId,
  roomId: Schema.String,
  userId: UserId,
});

type JoinPollOutput = typeof JoinPollOutput.Type;

export function joinPoll(
  input: JoinPollInput,
): Effect.Effect<
  JoinPollOutput,
  DatabaseError | ParseResult.ParseError | PollNotFoundError,
  PollRepository | RoomRepository
> {
  return Effect.gen(function* () {
    const pollRepo = yield* PollRepository;
    const roomRepo = yield* RoomRepository;
    const poll = yield* pollRepo.findById(input.pollId);

    yield* roomRepo.addMember(poll.roomId, input.userId);
    yield* pollRepo.addParticipant(poll.id, input.userId);

    return {
      pollId: poll.id,
      roomId: poll.roomId,
      userId: input.userId,
    };
  });
}
