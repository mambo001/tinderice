import { Data, Effect, flow, Layer, Schema } from "effect";

import { User } from "@/domain/entities";
import { UserRepository } from "@/domain/ports";
import { DatabaseError, UserNotFoundError } from "@/domain/errors";
import { D1DatabaseTag } from "@/shared/config/env";

interface UserRow {
  id: string;
  clientId: string;
  name: string;
  email: string;
  createdAt: number;
  updatedAt: number | null;
}

const encodeUser = Schema.encode(User);

export const D1UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;

    const findById = (id: string) =>
      Effect.gen(function* () {
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
        const encoded = yield* encodeUser(user);
        yield* findById(user.id).pipe(
          Effect.catchTags({
            UserNotFoundError: () => {
              return Effect.tryPromise({
                try: () =>
                  db
                    .prepare(
                      "INSERT INTO users (id, clientId, name, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                    )
                    .bind(
                      encoded.id,
                      encoded.clientId,
                      encoded.name,
                      encoded.email,
                      encoded.createdAt,
                      encoded.updatedAt,
                    )
                    .run(),
                catch: (err) =>
                  new DatabaseError({
                    message: `Failed to save user: ${err}`,
                  }),
              });
            },
          }),
        );
      });

    const deleteUser = (id: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db.prepare("DELETE FROM users WHERE id = ?").bind(id).run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to delete user: ${err}`,
            }),
        });
      });

    return UserRepository.of({
      findById,
      save: saveUser,
      delete: deleteUser,
    });
  }),
);
