import { Effect, Layer, Schema } from "effect";

import { Poll, PollDish, PollResponse } from "@/domain/entities";
import { PollRepository } from "@/domain/ports";
import {
  DatabaseError,
  PollGameplayError,
  PollNotFoundError,
} from "@/domain/errors";
import { selectPollWinner, rankPollResults } from "@/domain/services";
import { D1DatabaseTag } from "@/shared/config/env";

interface PollRow {
  id: string;
  roomId: string;
  ownerId: string;
  title: string;
  participants: string;
  winnerDishId: string | null;
  startedAt: number;
  deadlineAt: number;
  endedAt: number | null;
  isActive: number | boolean;
}

interface PollDishRow {
  pollId: string;
  dishId: string;
  dishName: string;
  imageUrl: string;
  position: number;
}

interface PollResponseRow {
  pollId: string;
  dishId: string;
  userId: string;
  reaction: string;
  respondedAt: number;
}

const encodePoll = Schema.encode(Poll);
const encodePollDish = Schema.encode(PollDish);
const encodePollResponse = Schema.encode(PollResponse);

export const D1PollRepositoryLive = Layer.effect(
  PollRepository,
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;

    const decodePollRows = Schema.decodeUnknown(Schema.Array(Poll));
    const decodePollDishRows = Schema.decodeUnknown(Schema.Array(PollDish));
    const decodePollResponseRows = Schema.decodeUnknown(Schema.Array(PollResponse));

    const toPoll = (row: PollRow) => ({
      ...row,
      participants: JSON.parse(row.participants) as string[],
      isActive: row.isActive === true || row.isActive === 1,
    });

    const findById = (id: string) =>
      Effect.gen(function* () {
        const row = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  polls.id,
                  polls.roomId,
                  polls.ownerId,
                  polls.title,
                  COALESCE((
                    SELECT json_group_array(poll_participants.userId)
                    FROM poll_participants
                    WHERE poll_participants.pollId = polls.id
                  ), json('[]')) AS participants,
                  polls.winnerDishId,
                  polls.startedAt,
                  polls.deadlineAt,
                  polls.endedAt,
                  polls.isActive
                FROM polls
                WHERE polls.id = ?`,
              )
              .bind(id)
              .first<PollRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query poll by ID: ${err}`,
            }),
        });

        if (!row) {
          return yield* Effect.fail(
            new PollNotFoundError({
              message: `Poll with ID ${id} not found`,
            }),
          );
        }

        return yield* Schema.decodeUnknown(Poll)(toPoll(row));
      });

    const findByRoomId = (roomId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  polls.id,
                  polls.roomId,
                  polls.ownerId,
                  polls.title,
                  COALESCE((
                    SELECT json_group_array(poll_participants.userId)
                    FROM poll_participants
                    WHERE poll_participants.pollId = polls.id
                  ), json('[]')) AS participants,
                  polls.winnerDishId,
                  polls.startedAt,
                  polls.deadlineAt,
                  polls.endedAt,
                  polls.isActive
                FROM polls
                WHERE polls.roomId = ?
                ORDER BY polls.startedAt DESC`,
              )
              .bind(roomId)
              .all<PollRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query polls by room ID: ${err}`,
            }),
        });

        return yield* decodePollRows(rows.results.map(toPoll));
      });

    const findDishesByPollId = (pollId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT pollId, dishId, dishName, imageUrl, position
                 FROM poll_dishes
                 WHERE pollId = ?
                 ORDER BY position ASC`,
              )
              .bind(pollId)
              .all<PollDishRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query poll dishes: ${err}`,
            }),
        });

        return yield* decodePollDishRows(rows.results);
      });

    const findResponsesByPollId = (pollId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT pollId, dishId, userId, reaction, respondedAt
                 FROM poll_responses
                 WHERE pollId = ?`,
              )
              .bind(pollId)
              .all<PollResponseRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query poll responses: ${err}`,
            }),
        });

        return yield* decodePollResponseRows(rows.results);
      });

    const savePoll = (poll: Poll) =>
      Effect.gen(function* () {
        const encoded = yield* encodePoll(poll);
        yield* Effect.tryPromise({
          try: async () => {
            await db.batch([
              db
                .prepare(
                  `INSERT INTO polls (
                    id,
                    roomId,
                    ownerId,
                    title,
                    winnerDishId,
                    startedAt,
                    deadlineAt,
                    endedAt,
                    isActive
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                )
                .bind(
                  encoded.id,
                  encoded.roomId,
                  encoded.ownerId,
                  encoded.title,
                  encoded.winnerDishId,
                  encoded.startedAt,
                  encoded.deadlineAt,
                  encoded.endedAt,
                  encoded.isActive,
                ),
              ...encoded.participants.map((userId) =>
                db
                  .prepare(
                    "INSERT INTO poll_participants (pollId, userId) VALUES (?, ?)",
                  )
                  .bind(encoded.id, userId),
              ),
            ]);
          },
          catch: (err) =>
            new DatabaseError({
              message: `Failed to save poll: ${err}`,
            }),
        });
      });

    const saveDishes = (pollId: string, dishes: readonly PollDish[]) =>
      Effect.gen(function* () {
        const encodedDishes = yield* Effect.forEach(dishes, (dish) => encodePollDish(dish));

        yield* Effect.tryPromise({
          try: async () => {
            await db.batch(
              encodedDishes.map((dish) =>
                db
                  .prepare(
                    `INSERT INTO poll_dishes (pollId, dishId, dishName, imageUrl, position)
                     VALUES (?, ?, ?, ?, ?)`,
                  )
                  .bind(pollId, dish.dishId, dish.dishName, dish.imageUrl, dish.position),
              ),
            );
          },
          catch: (err) =>
            new DatabaseError({
              message: `Failed to save poll dishes: ${err}`,
            }),
        });
      });

    const addParticipant = (pollId: string, userId: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                "INSERT OR IGNORE INTO poll_participants (pollId, userId) VALUES (?, ?)",
              )
              .bind(pollId, userId)
              .run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to add poll participant: ${err}`,
            }),
        });
      });

    const upsertResponse = (response: PollResponse) =>
      Effect.gen(function* () {
        const encoded = yield* encodePollResponse(response);

        yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `INSERT INTO poll_responses (pollId, dishId, userId, reaction, respondedAt)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(pollId, dishId, userId)
                 DO UPDATE SET reaction = excluded.reaction, respondedAt = excluded.respondedAt`,
              )
              .bind(
                encoded.pollId,
                encoded.dishId,
                encoded.userId,
                encoded.reaction,
                encoded.respondedAt,
              )
              .run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to save poll response: ${err}`,
            }),
        });
      });

    const finish = (pollId: string, winnerDishId: string | null, endedAt: Date) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `UPDATE polls
                 SET winnerDishId = ?, endedAt = ?, isActive = FALSE
                 WHERE id = ?`,
              )
              .bind(winnerDishId, endedAt.getTime(), pollId)
              .run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to finish poll: ${err}`,
            }),
        });
      });

    const computeWinner = (pollId: string) =>
      Effect.gen(function* () {
        const poll = yield* findById(pollId).pipe(
          Effect.mapError(
            (error) =>
              error instanceof PollNotFoundError
                ? new PollGameplayError({ message: error.message })
                : error,
          ),
        );
        const dishes = yield* findDishesByPollId(pollId);
        const responses = yield* findResponsesByPollId(pollId);

        if (dishes.length === 0) {
          return yield* Effect.fail(
            new PollGameplayError({
              message: `Poll ${pollId} has no dishes assigned`,
            }),
          );
        }

        const results = rankPollResults(poll, dishes, responses);
        return selectPollWinner(poll, results);
      });

    const deletePoll = (id: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () => db.prepare("DELETE FROM polls WHERE id = ?").bind(id).run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to delete poll: ${err}`,
            }),
        });
      });

    return PollRepository.of({
      findById,
      findByRoomId,
      findDishesByPollId,
      findResponsesByPollId,
      addParticipant,
      saveDishes,
      upsertResponse,
      finish,
      computeWinner,
      save: savePoll,
      delete: deletePoll,
    });
  }),
);
