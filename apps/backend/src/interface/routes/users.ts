import { Hono } from "hono";
import { Effect } from "effect";

import { UserService } from "@/application/services";
import { createUser } from "@/application/use-cases/create-user";
import { runEffect } from "../../app";
import { CreateUserDto } from "../dto";
import type { Env } from "../../shared/config/env";

export const userRoutes = new Hono<{ Bindings: Env }>();

userRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const dto = CreateUserDto.make({
    ...body,
    clientID: c.req.header("X-Client-ID") || "",
  });

  const user = await runEffect(
    c,
    createUser({
      name: dto.name,
      email: dto.email || "",
      clientId: c.req.header("X-Client-ID") || "",
    }),
  ).catch((err) => {
    throw err;
  });

  return c.json(user, 201);
});

userRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await runEffect(
    c,
    Effect.flatMap(UserService, (svc) => svc.findByid(id)),
  );

  return c.json(user);
});
