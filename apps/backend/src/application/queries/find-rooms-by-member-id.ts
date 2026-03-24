import { Effect } from "effect";

import { RoomRepository } from "@/domain/ports";

export function findRoomsByMemberId(memberId: string) {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    return yield* repo.findByMemberId(memberId);
  });
}
