import { Effect } from "effect";

import { PollRepository } from "@/domain/ports";

export function findPollsByRoomId(roomId: string) {
  return Effect.gen(function* () {
    const repo = yield* PollRepository;
    return yield* repo.findByRoomId(roomId);
  });
}
