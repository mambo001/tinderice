import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";

export function findPollDishesByPollId(pollId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    return yield* repo.findDishesByPollId(pollId);
  });
}
