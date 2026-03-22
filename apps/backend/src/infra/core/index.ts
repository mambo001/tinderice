import { Effect, Layer } from "effect";

import { UserIdGenerator } from "@/domain/ports";
import { makeUserId } from "@/domain/value-objects/user-id";

export const UserIdGeneratorLive = Layer.succeed(UserIdGenerator, {
  next: () =>
    Effect.sync(() => {
      return makeUserId(crypto.randomUUID());
    }),
});