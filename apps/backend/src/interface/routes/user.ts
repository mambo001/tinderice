import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { findByUserId, findUsersByIds } from "@/application/queries";
import { createUser, findOrCreateUser } from "@/application/commands";
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

const CheckClientIdHeaders = Schema.Struct({
  clientId: Schema.NonEmptyString,
});

const LookupUsersBody = Schema.Struct({
  ids: Schema.Array(UserId),
});

const decodeCreateUserBody = Schema.decodeUnknown(CreateUserBody);
const decodeCreateUserHeaders = Schema.decodeUnknown(CreateUserHeaders);
const decodeGetUserParams = Schema.decodeUnknown(GetUserParams);
const decodeLookupUsersBody = Schema.decodeUnknown(LookupUsersBody);

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

userRoutes.get("/client-id", async (c) => {
  const rawHeaders = {
    clientId: c.req.header("X-Client-ID"),
  };
  const program = Effect.gen(function* () {
    const headers =
      yield* Schema.decodeUnknown(CheckClientIdHeaders)(rawHeaders);
    return yield* findOrCreateUser({ clientId: headers.clientId });
  });

  const user = await runEffect(c, program);

  return c.json(user);
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

userRoutes.post("/lookup", async (c) => {
  const rawBody = await c.req.json();

  const program = Effect.gen(function* () {
    const body = yield* decodeLookupUsersBody(rawBody);
    return yield* findUsersByIds(body.ids);
  });

  const users = await runEffect(c, program);

  return c.json(users);
});
