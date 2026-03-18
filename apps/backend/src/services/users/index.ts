import { Array, Context, Effect, Layer, ParseResult, Schema } from "effect";

import { Database } from "../db";

const UserId = Schema.String;
type UserId = typeof UserId.Type;

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  nameUpdatedAt: Schema.NullOr(Schema.Number),
  createdAt: Schema.Number,
}) {}

class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  {
    id: UserId,
  },
) {}

class GenericUsersError extends Schema.TaggedError<GenericUsersError>()(
  "GenericUsersError",
  {
    id: UserId,
    error: Schema.Defect,
  },
) {}

const UsersError = Schema.Union(UserNotFoundError, GenericUsersError);
type UsersError = typeof UsersError.Type;

class CreateUserPayload extends Schema.Class<CreateUserPayload>(
  "CreateUserPayload",
)({
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
}) {}

const decodeUserFromUnknown = Schema.decodeUnknown(User);
const decodeUsersFromUnknown = Schema.decodeUnknown(Schema.Array(User));

export class Users extends Context.Tag("@app/Users")<
  Users,
  {
    readonly findById: (
      id: UserId,
    ) => Effect.Effect<User, UsersError | ParseResult.ParseError>;
    readonly findOrCreateUser: (
      id: UserId,
    ) => Effect.Effect<User, UsersError | ParseResult.ParseError>;
    readonly findAll: () => Effect.Effect<
      readonly User[],
      ParseResult.ParseError
    >;
    readonly createUser: (
      payload: CreateUserPayload,
    ) => Effect.Effect<void, GenericUsersError | ParseResult.ParseError>;
  }
>() {
  static readonly layer = Layer.effect(
    Users,
    Effect.gen(function* () {
      const db = yield* Database;

      const findById = Effect.fn("Users.findById")(function* (id: UserId) {
        const results = yield* db.query("SELECT * FROM users WHERE id = ?", [
          id,
        ]);

        if (results.length === 0) {
          yield* Effect.fail(new UserNotFoundError({ id }));
        }

        return yield* decodeUserFromUnknown(results[0]);
      });

      const findAll = Effect.fn("Users.findAll")(function* () {
        const results = yield* db.query("SELECT * FROM users LIMIT 50", []);

        return yield* decodeUsersFromUnknown(results);
      });

      const createUser = Effect.fn("Users.createUser")(function* (
        payload: CreateUserPayload,
      ) {
        yield* db.execute(
          "INSERT INTO users (name, email, created_at) VALUES (?, ?, ?)",
          [payload.name, payload.email, Date.now()],
        );
      });

      const findOrCreateUser = Effect.fn("Users.findOrCreateUser")(function* (
        id: UserId,
      ) {
        const results = yield* db.query("SELECT * FROM users WHERE id = ?", [
          id,
        ]);

        if (results.length === 0) {
          const newUser = CreateUserPayload.make({
            name: "New User",
            email: null,
          });
          yield* createUser(newUser);
        }

        return yield* findById(id);
      });

      return Users.of({
        findById,
        findAll,
        findOrCreateUser,
        createUser,
      });
    }),
  );
  static readonly stubLayer = Layer.effect(
    Users,
    Effect.gen(function* () {
      const findById = Effect.fn("Users.findById")(function* (id: UserId) {
        const response = yield* Effect.succeed(
          new User({
            id,
            name: "John Doe",
            email: "john.doe@example.com",
            nameUpdatedAt: null,
            createdAt: Date.now(),
          }),
        );
        return response;
      });

      const findAll = Effect.fn("Users.findAll")(function* () {
        const response = yield* Effect.succeed(
          new User({
            id: crypto.randomUUID(),
            name: "John Doe",
            email: "john.doe@example.com",
            nameUpdatedAt: null,
            createdAt: Date.now(),
          }),
        );
        return [response];
      });

      const createUser = Effect.fn("Users.createUser")(function* (
        payload: CreateUserPayload,
      ) {
        const response = yield* Effect.succeed(
          new User({
            id: crypto.randomUUID(),
            name: payload.name,
            email: payload.email,
            nameUpdatedAt: null,
            createdAt: Date.now(),
          }),
        );
        return response;
      });

      const findOrCreateUser = Effect.fn("Users.findOrCreateUser")(function* (
        id: UserId,
      ) {
        const response = yield* Effect.succeed(
          new User({
            id,
            name: "John Doe",
            email: "john@example.com",
            nameUpdatedAt: null,
            createdAt: Date.now(),
          }),
        );
        return response;
      });

      return Users.of({
        findById,
        findAll,
        findOrCreateUser,
        createUser,
      });
    }),
  );
}
