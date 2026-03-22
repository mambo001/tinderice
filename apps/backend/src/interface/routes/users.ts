import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { findByUserId } from "@/application/queries";
import { createUser } from "@/application/commands";
import { UserId } from "@/domain/value-objects";

const CreateUserBody = Schema.Struct({
  name: Schema.NonEmptyString,
  email: Schema.NonEmptyString,
});

const CreateUserHeaders = Schema.Struct({
  clientId: Schema.NonEmptyString,
});

const GetUserParams = Schema.Struct({
  id: UserId,
});

const decodeCreateUserBody = Schema.decodeUnknown(CreateUserBody);
const decodeCreateUserHeaders = Schema.decodeUnknown(CreateUserHeaders);
const decodeGetUserParams = Schema.decodeUnknown(GetUserParams);

export const userRoutes = new Hono<{ Bindings: Env }>();

userRoutes.post("/", async (c) => {
  const rawBody = await c.req.json();
  const rawHeaders = {
    clientId: c.req.header("X-Client-ID"),
  };

  const program = Effect.gen(function* () {
    const body = yield* decodeCreateUserBody(rawBody);
    const headers = yield* decodeCreateUserHeaders(rawHeaders);

    return yield* createUser({
      name: body.name,
      email: body.email,
      clientId: headers.clientId,
    });
  });

  const user = await runEffect(c, program);

  return c.json(user, 201);
});

userRoutes.get("/:id", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetUserParams(rawParams);
    return yield* findByUserId(params.id);
  });

  const user = await runEffect(c, program);

  return c.json(user);
});
