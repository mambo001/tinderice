import { Context, Effect, ParseResult } from "effect";

import { Room } from "@/domain/entities";
import { DatabaseError, RoomNotFoundError } from "@/domain/errors";

export interface RoomRepository {
  readonly findById: (
    id: string,
  ) => Effect.Effect<
    Room,
    RoomNotFoundError | DatabaseError | ParseResult.ParseError
  >;
  readonly findByOwnerId: (
    ownerId: string,
  ) => Effect.Effect<
    readonly Room[],
    DatabaseError | ParseResult.ParseError
  >;
  readonly findByMemberId: (
    memberId: string,
  ) => Effect.Effect<
    readonly Room[],
    DatabaseError | ParseResult.ParseError
  >;
  readonly save: (
    room: Room,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly delete: (id: string) => Effect.Effect<void, DatabaseError>;
}

export const RoomRepository =
  Context.GenericTag<RoomRepository>("RoomRepository");
