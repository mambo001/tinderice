import { Context, Effect, ParseResult } from "effect";

import { Poll } from "@/domain/entities";
import { DatabaseError, PollNotFoundError } from "@/domain/errors";

export interface PollRepository {
  readonly findById: (
    id: string,
  ) => Effect.Effect<
    Poll,
    PollNotFoundError | DatabaseError | ParseResult.ParseError
  >;
  readonly save: (
    poll: Poll,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly delete: (id: string) => Effect.Effect<void, DatabaseError>;
}

export const PollRepository =
  Context.GenericTag<PollRepository>("PollRepository");
