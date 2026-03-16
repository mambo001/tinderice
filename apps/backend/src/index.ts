import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";

class NumberService extends Context.Tag("@app/NumberService")<
  NumberService,
  { readonly getNumber: () => Effect.Effect<string> }
>() {
  static live = Layer.succeed(this, {
    getNumber: () => {
      const number = Math.floor(Math.random() * 100);
      return Effect.succeed(`Your random number is: ${number}`);
    },
  });
}

// Build your Effect layer(s)
const MainLayer = Layer.mergeAll(
  // add your service layers here
  NumberService.live,
);

const runtime = ManagedRuntime.make(MainLayer);

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "https://tinderice-web.reubenmark.workers.dev",
      "http://localhost:5173",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/", (c) =>
  runtime.runPromise(
    Effect.gen(function* () {
      yield* Effect.log("Handling /");
      return c.text("Hello, world");
    }),
  ),
);

app.get("/api", (c) =>
  runtime.runPromise(
    Effect.gen(function* () {
      yield* Effect.log("Handling /api");
      return c.text("API/Hello World");
    }),
  ),
);

app.get("/api/items", (c) =>
  runtime.runPromise(
    Effect.gen(function* () {
      yield* Effect.log("Handling /api/items");
      return c.json({ items: [] });
    }),
  ),
);

export default app;
