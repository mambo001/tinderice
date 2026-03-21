import { Context, Effect, Layer } from "effect";
import { D1Database } from "@cloudflare/workers-types";

export interface Env {
  Tinderice: D1Database;
  ENVIRONMENT: "development" | "production";
}

export class D1DatabaseTag extends Context.Tag("D1Database")<
  D1DatabaseTag,
  D1Database
>() {}

export const makeD1Layer = (env: Env): Layer.Layer<D1DatabaseTag> =>
  Layer.succeed(D1DatabaseTag, env.Tinderice);
