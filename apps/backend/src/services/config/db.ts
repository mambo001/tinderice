import { Context, Effect, Layer, Redacted, Schema } from "effect";

const Port = Schema.NumberFromString.pipe(
  Schema.int(),
  Schema.between(1, 65535),
);

export class DatabaseConfig extends Context.Tag("@app/DatabaseConfig")<
  DatabaseConfig,
  {
    // readonly host: string;
    // readonly port: number;
    // readonly database: string;
    // readonly password: Redacted.Redacted;
  }
>() {
  static readonly layer = Layer.effect(
    DatabaseConfig,
    Effect.gen(function* () {
      const host = yield* Schema.Config("DB_HOST", Schema.String);
      const port = yield* Schema.Config("DB_PORT", Port);
      const database = yield* Schema.Config("DB_NAME", Schema.String);
      const password = yield* Schema.Config(
        "DB_PASSWORD",
        Schema.Redacted(Schema.String),
      );

      return DatabaseConfig.of({ host, port, database, password });
    }),
  );
}
