import { Context, Effect, ParseResult } from "effect";

import { User } from "@/domain/entities";
import { UserId } from "@/domain/entities/user-id.value";
import { DatabaseError, UserNotFoundError } from "@/domain/errors";

export interface UserRepository {
  readonly findById: (
    id: UserId,
  ) => Effect.Effect<
    User,
    UserNotFoundError | DatabaseError | ParseResult.ParseError
  >;
  readonly save: (
    user: User,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>;
}

export const UserRepository =
  Context.GenericTag<UserRepository>("UserRepository");
