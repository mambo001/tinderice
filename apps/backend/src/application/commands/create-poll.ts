import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError } from "@/domain/errors";
import { PollRepository, PollIdGenerator } from "@/domain/ports";
import { Poll } from "@/domain/entities";
import { PollId, UserId } from "@/domain/value-objects";

const CreatePollInput = Schema.Struct({
  title: Schema.NonEmptyString,
  participants: Schema.Array(UserId),
  ownerId: Schema.NonEmptyString,
  roomId: Schema.NonEmptyString,
});

type CreatePollInput = typeof CreatePollInput.Type;

const CreatePollOutput = Schema.Struct({
  id: PollId,
  title: Schema.String,
  startedAt: Schema.DateFromNumber,
  endedAt: Schema.NullishOr(Schema.DateFromNumber),
  isActive: Schema.Boolean,
});

type CreatePollOutput = typeof CreatePollOutput.Type;

const toCreatePollOutput = (poll: Poll): CreatePollOutput => ({
  id: poll.id,
  title: poll.title,
  startedAt: poll.startedAt,
  endedAt: poll.endedAt,
  isActive: poll.isActive,
});

export function createPoll(
  input: CreatePollInput,
): Effect.Effect<
  CreatePollOutput,
  DatabaseError | ParseResult.ParseError,
  PollRepository | PollIdGenerator
> {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const idGenerator = yield* PollIdGenerator;
    const now = new Date();

    const id = yield* idGenerator.next();
    const ownerId = UserId.make(input.ownerId);

    const poll = Poll.make({
      id,
      ownerId,
      title: input.title,
      participants: [...input.participants, ownerId],
      winnerDishId: null,
      startedAt: now,
      endedAt: null,
      isActive: true,
    });

    yield* repo.save(poll);

    return toCreatePollOutput(poll);
  });
}
