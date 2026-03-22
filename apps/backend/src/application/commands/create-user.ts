import { Effect, ParseResult, Schema } from "effect";

import { User } from "@/domain/entities/user";
import { DatabaseError } from "@/domain/errors";
import { UserRepository, UserIdGenerator } from "@/domain/ports";

export const CreateUserInput = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  clientId: Schema.String,
});

export type CreateUserInput = typeof CreateUserInput.Type;

export const CreateUserOutput = Schema.Struct({
  id: Schema.String,
  clientId: Schema.String,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
});

export type CreateUserOutput = typeof CreateUserOutput.Type;

const toCreateUserOutput = (user: User): CreateUserOutput => ({
  id: user.id,
  clientId: user.clientId,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export function createUser(
  input: CreateUserInput,
): Effect.Effect<
  CreateUserOutput,
  DatabaseError | ParseResult.ParseError,
  UserRepository | UserIdGenerator
> {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    const idGenerator = yield* UserIdGenerator;
    const now = new Date();

    // const existing = yield* repo.findById(UserId.make({id: input.name}))
    // if (existing) {
    //   return yield* Effect.fail(
    //     DomainError.conflict(`Email ${email.value} is already in use`),
    //   );
    // }

    const id = yield* idGenerator.next();

    const user = User.make({
      id,
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      createdAt: now,
      updatedAt: null,
    });

    yield* repo.save(user);

    return toCreateUserOutput(user);
  });
}
