import { Effect, ParseResult, Schema } from "effect";

import { DatabaseError } from "@/domain/errors";
import { RoomRepository, RoomIdGenerator } from "@/domain/ports";
import { Room, User } from "@/domain/entities";
import { makeUserId, UserId } from "@/domain/value-objects";

const CreateRoomInput = Schema.Struct({
  name: Schema.String,
  ownerId: Schema.String,
});

type CreateRoomInput = typeof CreateRoomInput.Type;

const CreateRoomOutput = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  createdAt: Schema.Date,
});

type CreateRoomOutput = typeof CreateRoomOutput.Type;

const toCreateRoomOutput = (room: Room): CreateRoomOutput => ({
  id: room.id,
  name: room.name,
  createdAt: room.createdAt,
});

export function createRoom(
  input: CreateRoomInput,
): Effect.Effect<
  CreateRoomOutput,
  DatabaseError | ParseResult.ParseError,
  RoomRepository | RoomIdGenerator
> {
  return Effect.gen(function* () {
    const repo = yield* RoomRepository;
    const idGenerator = yield* RoomIdGenerator;
    const now = new Date();

    const id = yield* idGenerator.next();
    const ownerId = UserId.make(input.ownerId);

    const room = Room.make({
      id,
      ownerId,
      name: input.name,
      members: [ownerId],
      createdAt: now,
    });

    yield* repo.save(room);

    return toCreateRoomOutput(room);
  });
}
