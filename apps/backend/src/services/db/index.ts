import { Context, Data, Effect, Layer } from "effect";
import { D1Database } from "@cloudflare/workers-types";

export class Database extends Context.Tag("@app/Database")<
  Database,
  {
    readonly query: (
      sql: string,
      params?: unknown[],
    ) => Effect.Effect<unknown[]>;
    readonly execute: (sql: string, params?: unknown[]) => Effect.Effect<void>;
  }
>() {
  static readonly layer = Layer.effect(
    Database,
    Effect.gen(function* () {
      // const query = 
      return Database.of({
        query: Effect.fn("Database.query")(function* (sql: string, params) {
        //   const config = yield* Context.get(DatabaseConfig);
        //   yield* Effect.log(
        //     `Connecting to database at ${config.host}:${config.port}`,
        //   );
          yield* Effect.log(
            `Executing query: ${sql} with params: ${JSON.stringify(params)}`,
          );
          return [];
        }),
        execute: Effect.fn("Database.execute")(function* (sql: string, params) {
        //   const config = yield* Context.get(DatabaseConfig);
        //   yield* Effect.log(
        //     `Connecting to database at ${config.host}:${config.port}`,
        //   );
          yield* Effect.log(
            `Executing command: ${sql} with params: ${JSON.stringify(params)}`,
          );
        }),
      });
    }),
  );
}
