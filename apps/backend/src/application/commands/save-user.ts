import { Effect } from "effect";

import { User } from "@/domain/entities/user";
import { UserRepository } from "@/domain/ports";

export function saveUser(user: User) {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    return yield* repo.save(user);
  });
}