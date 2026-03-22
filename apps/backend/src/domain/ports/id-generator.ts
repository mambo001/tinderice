import { Context, Effect } from "effect";

import type { UserId } from "@/domain/value-objects/user-id";

export class IdGenerator extends Context.Tag("IdGenerator")<
  IdGenerator,
  {
    readonly nextUserId: () => Effect.Effect<UserId>;
  }
>() {}
