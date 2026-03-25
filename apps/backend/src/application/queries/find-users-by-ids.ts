import { Effect } from "effect";

import { UserRepository } from "@/domain/ports";

export function findUsersByIds(ids: readonly string[]) {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    return yield* repo.findByIds(ids);
  });
}
