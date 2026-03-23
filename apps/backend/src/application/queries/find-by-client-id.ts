import { Effect } from "effect";

import { UserNotFoundError } from "@/domain/errors";
import { UserRepository } from "@/domain/ports";

export function findByClientId(clientId: string) {
  return Effect.gen(function* () {
    const repo = yield* UserRepository;
    const result = yield* repo.findByClientId(clientId);

    if (!result) {
      throw new UserNotFoundError({
        message: `User with clientId ${clientId} not found`,
      });
    }

    return clientId;
  });
}
