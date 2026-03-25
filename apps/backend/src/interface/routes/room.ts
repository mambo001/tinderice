import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { createRoom, touchRoomPresence } from "@/application/commands";
import { RoomId, UserId } from "@/domain/value-objects";
import {
  findRoomByRoomId,
  findRoomPresenceByRoomId,
  findRoomsByMemberId,
  findRoomsByOwnerId,
} from "@/application/queries";

const CreateRoomBody = Schema.Struct({
  name: Schema.NonEmptyString,
});

const CreateRoomHeaders = Schema.Struct({
  ownerId: Schema.NonEmptyString,
});

const GetRoomParams = Schema.Struct({
  id: RoomId,
});

const GetRoomsByUserParams = Schema.Struct({
  userId: UserId,
});

const TouchRoomPresenceHeaders = Schema.Struct({
  userId: UserId,
});

const decodeCreateRoomBody = Schema.decodeUnknown(CreateRoomBody);
const decodeCreateRoomHeaders = Schema.decodeUnknown(CreateRoomHeaders);
const decodeGetRoomParams = Schema.decodeUnknown(GetRoomParams);
const decodeGetRoomsByUserParams = Schema.decodeUnknown(GetRoomsByUserParams);
const decodeTouchRoomPresenceHeaders = Schema.decodeUnknown(TouchRoomPresenceHeaders);

export const roomRoutes = new Hono<{ Bindings: Env }>();

roomRoutes.post("/", async (c) => {
  const rawBody = await c.req.json();
  const ownerId = c.req.header("x-owner-id");
  const rawHeaders = {
    ownerId,
  };

  const program = Effect.gen(function* () {
    const body = yield* decodeCreateRoomBody(rawBody);
    const headers = yield* decodeCreateRoomHeaders(rawHeaders);

    return yield* createRoom({
      name: body.name,
      ownerId: headers.ownerId,
    });
  });

  const room = await runEffect(c, program);

  return c.json(room, 201);
});

roomRoutes.get("/owner/:userId", async (c) => {
  const rawParams = {
    userId: c.req.param("userId"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetRoomsByUserParams(rawParams);
    return yield* findRoomsByOwnerId(params.userId);
  });

  const rooms = await runEffect(c, program);

  return c.json(rooms);
});

roomRoutes.get("/member/:userId", async (c) => {
  const rawParams = {
    userId: c.req.param("userId"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetRoomsByUserParams(rawParams);
    return yield* findRoomsByMemberId(params.userId);
  });

  const rooms = await runEffect(c, program);

  return c.json(rooms);
});

roomRoutes.get("/:id", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetRoomParams(rawParams);
    return yield* findRoomByRoomId(params.id);
  });

  const user = await runEffect(c, program);

  return c.json(user);
});

roomRoutes.get("/:id/presence", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetRoomParams(rawParams);
    return yield* findRoomPresenceByRoomId(params.id);
  });

  const presence = await runEffect(c, program);

  return c.json(presence);
});

roomRoutes.post("/:id/presence", async (c) => {
  const rawParams = {
    id: c.req.param("id"),
  };
  const rawHeaders = {
    userId: c.req.header("x-user-id"),
  };

  const program = Effect.gen(function* () {
    const params = yield* decodeGetRoomParams(rawParams);
    const headers = yield* decodeTouchRoomPresenceHeaders(rawHeaders);

    yield* touchRoomPresence({
      roomId: params.id,
      userId: headers.userId,
    });
  });

  await runEffect(c, program);

  return c.body(null, 204);
});
