import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";

export function findPollResponsesByPollId(pollId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    return yield* repo.findResponsesByPollId(pollId);
  });
}
