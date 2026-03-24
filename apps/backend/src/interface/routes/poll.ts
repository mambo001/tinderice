import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { createPoll, finishPoll, joinPoll, respondToPoll } from "@/application/commands";
import { DishId, PollId, PollReaction, RoomId, UserId } from "@/domain/value-objects";
import {
  findPollByPollId,
  findPollDishesByPollId,
  findPollResponsesByPollId,
  findPollsByRoomId,
} from "@/application/queries";

const CreatePollBody = Schema.Struct({
  title: Schema.NonEmptyString,
  participants: Schema.Array(UserId),
});

const CreatePollHeaders = Schema.Struct({
  ownerId: Schema.NonEmptyString,
  roomId: Schema.NonEmptyString,
});

const JoinPollHeaders = Schema.Struct({
  userId: Schema.NonEmptyString,
});

const RespondToPollBody = Schema.Struct({
  dishId: DishId,
  reaction: PollReaction,
});

const GetPollParams = Schema.Struct({
  id: PollId,
});

const GetPollsByRoomParams = Schema.Struct({
  roomId: RoomId,
});

const decodeCreatePollBody = Schema.decodeUnknown(CreatePollBody);
const decodeCreatePollHeaders = Schema.decodeUnknown(CreatePollHeaders);
const decodeJoinPollHeaders = Schema.decodeUnknown(JoinPollHeaders);
const decodeRespondToPollBody = Schema.decodeUnknown(RespondToPollBody);
const decodeGetPollParams = Schema.decodeUnknown(GetPollParams);
const decodeGetPollsByRoomParams = Schema.decodeUnknown(GetPollsByRoomParams);

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

pollRoutes.get("/room/:roomId", async (c) => {
  const rawParams = {
    roomId: c.req.param("roomId"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollsByRoomParams(rawParams);
    return yield* findPollsByRoomId(params.roomId);
  });

  const polls = await runEffect(c, program);

  return c.json(polls);
});

pollRoutes.post("/:id/join", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };
  const rawHeaders = {
    userId: c.req.header("user-id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollParams(rawParams);
    const headers = yield* decodeJoinPollHeaders(rawHeaders);

    return yield* joinPoll({
      pollId: params.id,
      userId: UserId.make(headers.userId),
    });
  });

  const result = await runEffect(c, program);

  return c.json(result, 200);
});

pollRoutes.get("/:id/dishes", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollParams(rawParams);
    return yield* findPollDishesByPollId(params.id);
  });

  const dishes = await runEffect(c, program);

  return c.json(dishes);
});

pollRoutes.get("/:id/responses", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollParams(rawParams);
    return yield* findPollResponsesByPollId(params.id);
  });

  const responses = await runEffect(c, program);

  return c.json(responses);
});

pollRoutes.post("/:id/respond", async (c) => {
  const rawBody = await c.req.json();
  const rawParams = {
    id: c.req.param("id"),
  };
  const rawHeaders = {
    userId: c.req.header("user-id"),
  };

  const program = Effect.gen(function* () {
    const body = yield* decodeRespondToPollBody(rawBody);
    const params = yield* decodeGetPollParams(rawParams);
    const headers = yield* decodeJoinPollHeaders(rawHeaders);

    return yield* respondToPoll({
      pollId: params.id,
      dishId: body.dishId,
      reaction: body.reaction,
      userId: UserId.make(headers.userId),
    });
  });

  const result = await runEffect(c, program);

  return c.json(result, 200);
});

pollRoutes.post("/:id/finish", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetPollParams(rawParams);
    return yield* finishPoll({
      pollId: params.id,
    });
  });

  const result = await runEffect(c, program);

  return c.json(result, 200);
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
