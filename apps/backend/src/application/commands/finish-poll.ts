import { Effect, ParseResult, Schema } from "effect";

import {
  DatabaseError,
  PollGameplayError,
  PollNotFoundError,
} from "@/domain/errors";
import { PollRepository } from "@/domain/ports";
import { PollId } from "@/domain/value-objects";

const FinishPollInput = Schema.Struct({
  pollId: PollId,
});

type FinishPollInput = typeof FinishPollInput.Type;

const FinishPollOutput = Schema.Struct({
  pollId: PollId,
  winnerDishId: Schema.NullishOr(Schema.String),
});

type FinishPollOutput = typeof FinishPollOutput.Type;

export function finishPoll(
  input: FinishPollInput,
): Effect.Effect<
  FinishPollOutput,
  DatabaseError | PollGameplayError | PollNotFoundError | ParseResult.ParseError,
  PollRepository
> {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const winnerDishId = yield* repo.computeWinner(input.pollId);
    yield* repo.finish(input.pollId, winnerDishId, new Date());

    return {
      pollId: input.pollId,
      winnerDishId,
    };
  });
}
