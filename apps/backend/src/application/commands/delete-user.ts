import { Effect } from "effect";

import { UserRepository } from "@/domain/ports";

export function deleteUser(id: string) {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    return yield* repo.delete(id);
  });
}
