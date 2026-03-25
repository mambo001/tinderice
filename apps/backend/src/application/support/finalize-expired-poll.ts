import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";

export function finalizeExpiredPoll(pollId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const poll = yield* repo.findById(pollId);

    if (!poll.isActive || poll.deadlineAt.getTime() > Date.now()) {
      return poll;
    }

    const winnerDishId = yield* repo.computeWinner(pollId);
    yield* repo.finish(pollId, winnerDishId, new Date());

    return yield* repo.findById(pollId);
  });
}
