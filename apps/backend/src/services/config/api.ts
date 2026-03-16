import { Config, Context, Effect, Layer } from "effect";

export class ApiConfig extends Context.Tag("@app/ApiConfig")<
  ApiConfig,
  {
    readonly port: number;
    readonly baseUrl: string;
  }
>() {
  static readonly layer = Layer.effect(
    ApiConfig,
    Effect.gen(function* () {
      const port = yield* Config.number("API_PORT");
      const baseUrl = yield* Config.string("API_BASE_URL");

      return ApiConfig.of({
        port,
        baseUrl,
      });
    }),
  );

  // For tests - hardcoded values
  //   static readonly testLayer = Layer.succeed(
  //     ApiConfig,
  //     ApiConfig.of({
  //       apiKey: Redacted.make("test-key"),
  //       baseUrl: "https://test.example.com",
  //       timeout: 5000,
  //     })
  //   )
}
