import { Data, Effect, flow, Layer, Schema } from "effect";

import { User } from "@/domain/entities";
import { D1DatabaseTag } from "@/shared/config/env";
import { UserRepository } from "@/domain/ports";
import { DatabaseError, UserNotFoundError } from "@/domain/errors";

interface UserRow {
  id: string;
  clientId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
}

const findById = (id: string) =>
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;
    const row = yield* Effect.tryPromise({
      try: () =>
        db
          .prepare("SELECT * FROM users WHERE id = ?")
          .bind(id)
          .first<UserRow>(),
      catch: (err) =>
        new DatabaseError({
          message: `Failed to query user by ID: ${err}`,
        }),
    });
    if (!row) {
      return yield* Effect.fail(
        new UserNotFoundError({
          message: `User with ID ${id} not found`,
        }),
      );
    }
    return yield* Schema.decodeUnknown(User)(row);
  });

const saveUser = (user: User) =>
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;
    yield* findById(user.id).pipe(
      Effect.catchTags({
        UserNotFoundError: () =>
          Effect.tryPromise({
            try: () =>
              db
                .prepare(
                  "INSERT INTO users (id, clientId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                )
                .bind(
                  user.id,
                  user.clientId,
                  user.name,
                  user.email,
                  user.createdAt,
                  user.updatedAt,
                )
                .run(),
            catch: (err) =>
              new DatabaseError({
                message: `Failed to save user: ${err}`,
              }),
          }),
      }),
    );
  });

const deleteUser = (id: string) =>
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;
    yield* Effect.tryPromise({
      try: () => db.prepare("DELETE FROM users WHERE id = ?").bind(id).run(),
      catch: (err) =>
        new DatabaseError({
          message: `Failed to delete user: ${err}`,
        }),
    });
  });

export const D1UserRepositoryLive = D1DatabaseTag.pipe(
  Effect.map(
    (db): UserRepository => ({
      findById: flow(findById, Effect.provideService(D1DatabaseTag, db)),
      save: flow(saveUser, Effect.provideService(D1DatabaseTag, db)),
      delete: flow(deleteUser, Effect.provideService(D1DatabaseTag, db)),
    }),
  ),
  Layer.effect(UserRepository),
);
