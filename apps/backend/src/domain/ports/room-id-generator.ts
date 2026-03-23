import { Context, Effect } from "effect";

import { RoomId } from "@/domain/value-objects";

export class RoomIdGenerator extends Context.Tag("RoomIdGenerator")<
  RoomIdGenerator,
  {
    readonly next: () => Effect.Effect<RoomId>;
  }
>() {}
