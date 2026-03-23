import { Effect, Layer } from "effect";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import { UserIdGenerator, UsernameGenerator } from "@/domain/ports";
import { makeUserId } from "@/domain/value-objects/user-id";

export const UserIdGeneratorLive = Layer.succeed(UserIdGenerator, {
  next: () =>
    Effect.sync(() => {
      return makeUserId(crypto.randomUUID());
    }),
});

export const UsernameGeneratorLive = Layer.succeed(UsernameGenerator, {
  generate: () =>
    Effect.sync(() => {
      const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        style: 'capital'
      };

      const name: string = uniqueNamesGenerator(customConfig);
      return name;
    }),
});
