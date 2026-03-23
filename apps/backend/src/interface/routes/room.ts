import { Hono } from "hono";
import { Effect, Schema } from "effect";

import { runEffect } from "../../app";
import type { Env } from "@/shared/config";
import { createRoom } from "@/application/commands";
import { RoomId } from "@/domain/value-objects";
import { findRoomByRoomId } from "@/application/queries";

const CreateRoomBody = Schema.Struct({
  name: Schema.NonEmptyString,
});

const CreateRoomHeaders = Schema.Struct({
  ownerId: Schema.NonEmptyString,
});

const GetRoomParams = Schema.Struct({
  id: RoomId,
});

const decodeCreateRoomBody = Schema.decodeUnknown(CreateRoomBody);
const decodeCreateRoomHeaders = Schema.decodeUnknown(CreateRoomHeaders);
const decodeGetRoomParams = Schema.decodeUnknown(GetRoomParams);

export const roomRoutes = new Hono<{ Bindings: Env }>();

roomRoutes.post("/", async (c) => {
  const rawBody = await c.req.json();
  const rawHeaders = {
    ownerId: c.req.header("owner-id"),
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
