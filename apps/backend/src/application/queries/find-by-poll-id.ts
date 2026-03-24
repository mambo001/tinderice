import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";

export function findPollByPollId(pollId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    return yield* repo.findById(pollId);
  });
}
