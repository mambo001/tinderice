import { Hono } from "hono";
import { Effect, ManagedRuntime } from "effect";

import { userRoutes } from "@/interface/routes";
import type { Env } from "@/shared/config";
import { makeAppLayer, type AppServices } from "./layers";
import { corsMiddleware } from "./interface/middleware/cors";

const app = new Hono<{ Bindings: Env }>();

// app.use("*", authMiddleware)
app.use("*", corsMiddleware)

app.route("/user", userRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

export const runEffect = <A, E>(
  c: { env: Env },
  effect: Effect.Effect<A, E, AppServices>,
): Promise<A> => {
  const layer = makeAppLayer(c.env);
  const runtime = ManagedRuntime.make(layer);
  return runtime.runPromise(effect);
};

export default app;
