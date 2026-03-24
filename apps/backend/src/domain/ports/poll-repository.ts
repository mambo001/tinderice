import { Context, Effect, ParseResult } from "effect";

import { Poll, PollDish, PollResponse } from "@/domain/entities";
import {
  DatabaseError,
  PollGameplayError,
  PollNotFoundError,
} from "@/domain/errors";
import { PollReaction } from "@/domain/value-objects";

export interface PollRepository {
  readonly findById: (
    id: string,
  ) => Effect.Effect<
    Poll,
    PollNotFoundError | DatabaseError | ParseResult.ParseError
  >;
  readonly findByRoomId: (
    roomId: string,
  ) => Effect.Effect<
    readonly Poll[],
    DatabaseError | ParseResult.ParseError
  >;
  readonly findDishesByPollId: (
    pollId: string,
  ) => Effect.Effect<
    readonly PollDish[],
    DatabaseError | ParseResult.ParseError
  >;
  readonly findResponsesByPollId: (
    pollId: string,
  ) => Effect.Effect<
    readonly PollResponse[],
    DatabaseError | ParseResult.ParseError
  >;
  readonly addParticipant: (
    pollId: string,
    userId: string,
  ) => Effect.Effect<void, DatabaseError>;
  readonly saveDishes: (
    pollId: string,
    dishes: readonly PollDish[],
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly upsertResponse: (
    response: PollResponse,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly finish: (
    pollId: string,
    winnerDishId: string | null,
    endedAt: Date,
  ) => Effect.Effect<void, DatabaseError>;
  readonly computeWinner: (
    pollId: string,
  ) => Effect.Effect<
    string | null,
    | DatabaseError
    | PollGameplayError
    | PollNotFoundError
    | ParseResult.ParseError
  >;
  readonly save: (
    poll: Poll,
  ) => Effect.Effect<void, DatabaseError | ParseResult.ParseError>;
  readonly delete: (id: string) => Effect.Effect<void, DatabaseError>;
}

export const PollRepository =
  Context.GenericTag<PollRepository>("PollRepository");
