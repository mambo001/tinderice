import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { createRoom } from "@/application/commands";
import { RoomId, UserId } from "@/domain/value-objects";
import {
  findRoomByRoomId,
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

const decodeCreateRoomBody = Schema.decodeUnknown(CreateRoomBody);
const decodeCreateRoomHeaders = Schema.decodeUnknown(CreateRoomHeaders);
const decodeGetRoomParams = Schema.decodeUnknown(GetRoomParams);
const decodeGetRoomsByUserParams = Schema.decodeUnknown(GetRoomsByUserParams);

export const roomRoutes = new Hono<{ Bindings: Env }>();

roomRoutes.post("/", async (c) => {
  const rawBody = await c.req.json();
  const ownerId = c.req.header("owner-id");
  const rawHeaders = {
    ownerId,
  };
  console.log({ rawHeaders });

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
