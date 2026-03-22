import { Effect, Context, Layer } from "effect";
import { UserRepository } from "../../domain/ports/user-repository";
import { User } from "../../domain/entities/user";
import { UserNotFoundError } from "../../domain/errors";

export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const repo = yield* UserRepository;

    return {
      save: (user: User) => repo.save(user),
      delete: (id: string) => repo.delete(id),
    };
  }),
  dependencies: [Layer.service(UserRepository)],
}) {}
