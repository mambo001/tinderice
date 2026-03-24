import { Context, Effect } from "effect";

import { PollId } from "@/domain/value-objects";

export class PollIdGenerator extends Context.Tag("PollIdGenerator")<
  PollIdGenerator,
  {
    readonly next: () => Effect.Effect<PollId>;
  }
>() {}
