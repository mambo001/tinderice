import { Effect, Layer, Schema } from "effect";

import { Poll } from "@/domain/entities";
import { PollRepository } from "@/domain/ports";
import { DatabaseError, PollNotFoundError } from "@/domain/errors";
import { D1DatabaseTag } from "@/shared/config/env";

interface PollRow {
  id: string;
  ownerId: string;
  title: string;
  participants: string;
  winnerDishId: string | null;
  startedAt: number;
  endedAt: number | null;
  isActive: number | boolean;
}

const encodePoll = Schema.encode(Poll);

export const D1PollRepositoryLive = Layer.effect(
  PollRepository,
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;

    const findById = (id: string) =>
      Effect.gen(function* () {
        const row = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  polls.id,
                  polls.ownerId,
                  polls.title,
                  COALESCE((
                    SELECT json_group_array(poll_participants.userId)
                    FROM poll_participants
                    WHERE poll_participants.pollId = polls.id
                  ), json('[]')) AS participants,
                  polls.winnerDishId,
                  polls.startedAt,
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
        return yield* Schema.decodeUnknown(Poll)({
          ...row,
          participants: JSON.parse(row.participants) as string[],
          isActive: row.isActive === true || row.isActive === 1,
        });
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
                    ownerId,
                    title,
                    winnerDishId,
                    startedAt,
                    endedAt,
                    isActive
                  ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
                )
                .bind(
                  encoded.id,
                  encoded.ownerId,
                  encoded.title,
                  encoded.winnerDishId,
                  encoded.startedAt,
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

    const deletePoll = (id: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db.prepare("DELETE FROM polls WHERE id = ?").bind(id).run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to delete poll: ${err}`,
            }),
        });
      });

    return PollRepository.of({
      findById,
      save: savePoll,
      delete: deletePoll,
    });
  }),
);
