import { Effect } from "effect";

import { RoomNotFoundError } from "@/domain/errors";
import { RoomRepository } from "@/domain/ports";

export function findRoomByRoomId(id: string) {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    const room = yield* repo.findById(id);

    if (!room) {
      throw new RoomNotFoundError({
        message: `Room with id ${id} not found`,
      });
    }

    return room;
  });
}
