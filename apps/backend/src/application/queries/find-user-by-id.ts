import { UserNotFoundError } from "@/domain/errors";
import { UserRepository } from "@/domain/ports";
import { Effect } from "effect";

export function findByUserId(id: string) {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    const user = yield* repo.findById(id);

    if (!user) {
      throw new UserNotFoundError({
        message: `User with id ${id} not found`,
      });
    }

    return user;
  });
}
