import { Effect, ParseResult, pipe, Schema } from "effect";

import { User } from "@/domain/entities/user";
import { DatabaseError } from "@/domain/errors";
import {
  UserRepository,
  UserIdGenerator,
  UsernameGenerator,
} from "@/domain/ports";
import { saveUser } from "./save-user";

export const FindOrCreateUserInput = Schema.Struct({
  clientId: Schema.String,
});

export type FindOrCreateUserInput = typeof FindOrCreateUserInput.Type;

export const FindOrCreateUserOutput = Schema.Struct({
  id: Schema.String,
  clientId: Schema.String,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
});

export type FindOrCreateUserOutput = typeof FindOrCreateUserOutput.Type;

const toFindOrCreateUserOutput = (user: User): FindOrCreateUserOutput => ({
  id: user.id,
  clientId: user.clientId,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export function findOrCreateUser(
  input: FindOrCreateUserInput,
): Effect.Effect<
  FindOrCreateUserOutput,
  DatabaseError | ParseResult.ParseError,
  UserRepository | UserIdGenerator | UsernameGenerator
> {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    const idGenerator = yield* UserIdGenerator;
    const usernameGenerator = yield* UsernameGenerator;
    const now = new Date();

    const result = yield* pipe(
      repo.findByClientId(input.clientId),
      Effect.catchTag("UserNotFoundError", () =>
        Effect.gen(function* () {
          const id = yield* idGenerator.next();
          const username = yield* usernameGenerator.generate();
          const user = User.make({
            id,
            clientId: input.clientId,
            name: username,
            email: "",
            createdAt: now,
            updatedAt: null,
          });
          yield* saveUser(user);
          return yield* Effect.succeed(user);
        }),
      ),
      Effect.map(toFindOrCreateUserOutput),
    );

    return result;
  });
}
