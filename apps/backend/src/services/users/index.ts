import { Context, Effect, Layer, Schema } from "effect";

const UserId = Schema.String.pipe(Schema.brand("UserId"));
type UserId = typeof UserId.Type;

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
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

export class Users extends Context.Tag("@app/Users")<
  Users,
  {
    readonly findById: (id: UserId) => Effect.Effect<User, UsersError>;
    readonly findAll: () => Effect.Effect<User[], GenericUsersError>;
    readonly createUser: (
      payload: CreateUserPayload,
    ) => Effect.Effect<User, GenericUsersError>;
  }
>() {
  static readonly stubLayer = Layer.effect(
    Users,
    Effect.gen(function* () {
      const findById = Effect.fn("Users.findById")(function* (id: UserId) {
        const response = yield* Effect.succeed(
          new User({
            id,
            name: "John Doe",
            email: "john.doe@example.com",
          }),
        );
        return response;
      });

      const findAll = Effect.fn("Users.findAll")(function* () {
        const response = yield* Effect.succeed(
          new User({
            id: UserId.make(crypto.randomUUID()),
            name: "John Doe",
            email: "john.doe@example.com",
          }),
        );
        return [response];
      });

      const createUser = Effect.fn("Users.createUser")(function* (
        payload: CreateUserPayload,
      ) {
        const response = yield* Effect.succeed(
          new User({
            id: UserId.make(crypto.randomUUID()),
            name: payload.name,
            email: payload.email,
          }),
        );
        return response;
      });

      return Users.of({
        findById,
        findAll,
        createUser,
      });
    }),
  );
}
