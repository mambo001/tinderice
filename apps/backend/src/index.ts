import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DatabaseConfig } from "./services/config/db";
import { Database } from "./services/db";
import { Users } from "./services/users";
import { D1Database } from "@cloudflare/workers-types";

type Bindings = {
  DB: D1Database;
};

const userServiceLayer = Users.layer.pipe(Layer.provide(Database.layer));

// Build your Effect layer(s)
const MainLayer = Layer.mergeAll(userServiceLayer);

const runtime = ManagedRuntime.make(MainLayer);

const app = new Hono<{
  Bindings: Bindings;
}>();

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

app.get("/api/users", (c) =>
  runtime.runPromise(
    Effect.gen(function* () {
      const user = yield* Users..findAll()
      yield* Effect.log("Handling /api/users");
      return c.json({ user });
    }),
  ),
);

export default app;
