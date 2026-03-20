import { Effect, ParseResult } from "effect";

import { UserRepository } from "@/domain/ports/user-repository";
import { User } from "@/domain/entities/user";
import { DatabaseError } from "@/domain/errors";
import { UserService } from "../services/user-service";

export interface CreateUserInput {
  name: string;
  email: string;
  clientId: string;
}

export interface CreateUserOutput {
  id: string;
  clientId: string;
  name: string;
  email: string | null;
  createdAt: Date;
}

export const createUser = (
  input: CreateUserInput,
): Effect.Effect<
  CreateUserOutput,
  DatabaseError | ParseResult.ParseError,
  UserRepository | UserService
> =>
  Effect.gen(function* () {
    const repo = yield* UserRepository;

    // const existing = yield* repo.findById(UserId.make({id: input.name}))
    // if (existing) {
    //   return yield* Effect.fail(
    //     DomainError.conflict(`Email ${email.value} is already in use`),
    //   );
    // }

    const user = User.make({
      id: crypto.randomUUID(),
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      createdAt: new Date(),
      updatedAt: null,
    });

    yield* repo.save(user);

    return {
      id: user.id,
      clientId: user.clientId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  });
