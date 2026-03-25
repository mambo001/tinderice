import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";
import { finalizeExpiredPoll } from "@/application/support/finalize-expired-poll";

export function findCompletedPollSummariesByRoomId(roomId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    const polls = yield* repo.findByRoomId(roomId);

    yield* Effect.forEach(polls, (poll) => finalizeExpiredPoll(poll.id));

    return yield* repo.findCompletedSummariesByRoomId(roomId);
  });
}
