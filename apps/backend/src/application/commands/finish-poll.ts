import { Effect, ParseResult, Schema } from "effect";

import {
  DatabaseError,
  PollGameplayError,
  PollNotFoundError,
} from "@/domain/errors";
import { PollRepository } from "@/domain/ports";
import { PollId } from "@/domain/value-objects";
import { finalizeExpiredPoll } from "@/application/support/finalize-expired-poll";

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
    const poll = yield* finalizeExpiredPoll(input.pollId);
    const repo = yield* PollRepository;
    const winnerDishId = poll.isActive
      ? yield* repo.computeWinner(input.pollId)
      : (poll.winnerDishId ?? null);

    if (poll.isActive) {
      yield* repo.finish(input.pollId, winnerDishId, new Date());
    }

    return {
      pollId: input.pollId,
      winnerDishId,
    };
  });
}
