import { Context, Effect, ParseResult } from "effect";

import { User } from "@/domain/entities";
import { DatabaseError, UserNotFoundError } from "@/domain/errors";

export interface UserRepository {
  readonly findById: (
    id: string,
  ) => Effect.Effect<
    User,
    UserNotFoundError | DatabaseError | ParseResult.ParseError
  >;
  readonly save: (
    user: User,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly delete: (id: string) => Effect.Effect<void, DatabaseError>;
}

export const UserRepository =
  Context.GenericTag<UserRepository>("UserRepository");
