import { Effect } from "effect";

import { RoomRepository } from "@/domain/ports";

export function findRoomsByOwnerId(ownerId: string) {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    return yield* repo.findByOwnerId(ownerId);
  });
}
