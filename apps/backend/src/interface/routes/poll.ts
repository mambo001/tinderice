import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { createPoll } from "@/application/commands";
import { PollId, UserId } from "@/domain/value-objects";
import { findPollByPollId } from "@/application/queries";

const CreatePollBody = Schema.Struct({
  title: Schema.NonEmptyString,
  participants: Schema.Array(UserId),
});

const CreatePollHeaders = Schema.Struct({
  ownerId: Schema.NonEmptyString,
  roomId: Schema.NonEmptyString,
});

const GetPollParams = Schema.Struct({
  id: PollId,
});

const decodeCreatePollBody = Schema.decodeUnknown(CreatePollBody);
const decodeCreatePollHeaders = Schema.decodeUnknown(CreatePollHeaders);
const decodeGetPollParams = Schema.decodeUnknown(GetPollParams);

export const pollRoutes = new Hono<{ Bindings: Env }>();

pollRoutes.post("/", async (c) => {
  const rawBody = await c.req.json();
  const rawHeaders = {
    ownerId: c.req.header("owner-id"),
    roomId: c.req.header("room-id"),
  };

  const program = Effect.gen(function* () {
    const body = yield* decodeCreatePollBody(rawBody);
    const headers = yield* decodeCreatePollHeaders(rawHeaders);

    return yield* createPoll({
      title: body.title,
      participants: body.participants,
      ownerId: headers.ownerId,
      roomId: headers.roomId,
    });
  });

  const poll = await runEffect(c, program);

  return c.json(poll, 201);
});

pollRoutes.get("/:id", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollParams(rawParams);
    return yield* findPollByPollId(params.id);
  });

  const poll = await runEffect(c, program);

  return c.json(poll);
});
