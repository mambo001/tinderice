import { Context, Effect } from "effect";

export class UsernameGenerator extends Context.Tag("UsernameGenerator")<
  UsernameGenerator,
  {
    readonly generate: () => Effect.Effect<string>;
  }
>() {}