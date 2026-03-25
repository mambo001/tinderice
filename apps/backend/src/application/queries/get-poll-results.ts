import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";
import { rankPollResults } from "@/domain/services";
import { finalizeExpiredPoll } from "@/application/support/finalize-expired-poll";

export function getPollResults(pollId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const poll = yield* finalizeExpiredPoll(pollId);
    const dishes = yield* repo.findDishesByPollId(pollId);
    const responses = yield* repo.findResponsesByPollId(pollId);

    return rankPollResults(poll, dishes, responses);
  });
}
