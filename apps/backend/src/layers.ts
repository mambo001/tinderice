import { Layer } from "effect";

import { D1RoomRepositoryLive, D1UserRepositoryLive } from "@/infra/cloudflare";
import { makeD1Layer, type Env } from "@/shared/config";
import {
  UserIdGeneratorLive,
  UsernameGeneratorLive,
  RoomIdGeneratorLive,
} from "@/infra/core";

// Builds the full application layer from a Cloudflare Env binding.
// Called once per request since D1 is request-scoped.
export const makeAppLayer = (env: Env) => {
  // Provide the raw D1 binding into the Effect context
  const D1Live = makeD1Layer(env);

  // Infrastructure layers — each implements a port interface
  const RepositoryLayer = Layer.mergeAll(
    D1UserRepositoryLive,
    D1RoomRepositoryLive,
  ).pipe(Layer.provide(D1Live));

  // Application layer — depends on infrastructure ports
  const AppServiceLayer = Layer.mergeAll(
    RepositoryLayer,
    UserIdGeneratorLive,
    UsernameGeneratorLive,
    RoomIdGeneratorLive,
  );

  return Layer.mergeAll(AppServiceLayer, RepositoryLayer);
};

// The services provided by the app layer (e.g. UserRepository)
export type AppServices = Layer.Layer.Success<ReturnType<typeof makeAppLayer>>;
