import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError } from "@/domain/errors";
import { PollRepository, PollIdGenerator } from "@/domain/ports";
import { Poll, PollDish } from "@/domain/entities";
import { DishId, PollId, RoomId, UserId } from "@/domain/value-objects";
import { POLL_CANDIDATE_DISHES } from "@/application/support/poll-candidates";

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
  deadlineAt: Schema.DateFromNumber,
  endedAt: Schema.NullishOr(Schema.DateFromNumber),
  isActive: Schema.Boolean,
});

type CreatePollOutput = typeof CreatePollOutput.Type;

const toCreatePollOutput = (poll: Poll): CreatePollOutput => ({
  id: poll.id,
  title: poll.title,
  startedAt: poll.startedAt,
  deadlineAt: poll.deadlineAt,
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
    const deadlineAt = new Date(now.getTime() + 5 * 60 * 1000);

    const id = yield* idGenerator.next();
    const ownerId = UserId.make(input.ownerId);
    const roomId = RoomId.make(input.roomId);
    const participants = Array.from(
      new Set([...input.participants, ownerId]),
    ).map((participantId) => UserId.make(participantId));

    const poll = Poll.make({
      id,
      roomId,
      ownerId,
      title: input.title,
      participants,
      winnerDishId: null,
      startedAt: now,
      deadlineAt,
      endedAt: null,
      isActive: true,
    });

    const pollDishes = POLL_CANDIDATE_DISHES.map((dish, index) =>
      PollDish.make({
        pollId: id,
        dishId: DishId.make(dish.id),
        dishName: dish.name,
        imageUrl: dish.imageUrl,
        position: index,
      }),
    );

    yield* repo.save(poll);
    yield* repo.saveDishes(id, pollDishes);

    return toCreatePollOutput(poll);
  });
}
