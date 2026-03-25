import { Effect } from "effect";

import { RoomRepository } from "@/domain/ports";

export function findRoomPresenceByRoomId(roomId: string) {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    return yield* repo.findPresenceByRoomId(roomId);
  });
}
