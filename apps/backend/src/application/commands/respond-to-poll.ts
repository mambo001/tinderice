import { Effect, ParseResult, Schema } from "effect";

import { PollResponse } from "@/domain/entities";
import {
  DatabaseError,
  PollGameplayError,
  PollNotFoundError,
} from "@/domain/errors";
import { PollRepository } from "@/domain/ports";
import {
  DishId,
  PollId,
  PollReaction,
  UserId,
  makeDishId,
} from "@/domain/value-objects";

const RespondToPollInput = Schema.Struct({
  pollId: PollId,
  dishId: DishId,
  userId: UserId,
  reaction: PollReaction,
});

type RespondToPollInput = typeof RespondToPollInput.Type;

const RespondToPollOutput = Schema.Struct({
  pollId: PollId,
  dishId: DishId,
  userId: UserId,
  reaction: PollReaction,
  isComplete: Schema.Boolean,
  winnerDishId: Schema.NullishOr(DishId),
});

type RespondToPollOutput = typeof RespondToPollOutput.Type;

export function respondToPoll(
  input: RespondToPollInput,
): Effect.Effect<
  RespondToPollOutput,
  DatabaseError | PollGameplayError | PollNotFoundError | ParseResult.ParseError,
  PollRepository
> {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const poll = yield* repo.findById(input.pollId);

    if (!poll.isActive) {
      return yield* Effect.fail(
        new PollGameplayError({
          message: "Poll is no longer active",
        }),
      );
    }

    if (!poll.participants.includes(input.userId)) {
      return yield* Effect.fail(
        new PollGameplayError({
          message: "User is not a participant in this poll",
        }),
      );
    }

    const dishes = yield* repo.findDishesByPollId(input.pollId);
    const hasDish = dishes.some((dish) => dish.dishId === input.dishId);

    if (!hasDish) {
      return yield* Effect.fail(
        new PollGameplayError({
          message: "Dish is not part of this poll",
        }),
      );
    }

    const response = PollResponse.make({
      pollId: input.pollId,
      dishId: input.dishId,
      userId: input.userId,
      reaction: input.reaction,
      respondedAt: new Date(),
    });

    yield* repo.upsertResponse(response);

    const responses = yield* repo.findResponsesByPollId(input.pollId);
    const requiredResponses = poll.participants.length * dishes.length;
    const isComplete = responses.length >= requiredResponses || Date.now() >= poll.deadlineAt.getTime();

    let winnerDishId: DishId | null = null;

    if (isComplete) {
      const nextWinnerDishId = yield* repo.computeWinner(input.pollId);
      winnerDishId = nextWinnerDishId ? makeDishId(nextWinnerDishId) : null;
      yield* repo.finish(input.pollId, nextWinnerDishId, new Date());
    }

    return {
      pollId: input.pollId,
      dishId: input.dishId,
      userId: input.userId,
      reaction: input.reaction,
      isComplete,
      winnerDishId,
    };
  });
}
