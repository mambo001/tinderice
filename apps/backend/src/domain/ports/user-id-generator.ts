import { Context, Effect } from "effect";

import type { UserId } from "@/domain/value-objects/user-id";

export class UserIdGenerator extends Context.Tag("UserIdGenerator")<
  UserIdGenerator,
  {
    readonly next: () => Effect.Effect<UserId>;
  }
>() {}