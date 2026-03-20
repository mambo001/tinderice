import { Layer } from "effect";

import { D1UserRepositoryLive } from "./infra/repositories/cloudflare";
import { D1DatabaseTag } from "./shared/config/env";
import type { Env } from "./shared/config/env";
import { UserService } from "./application/services";

// Builds the full application layer from a Cloudflare Env binding.
// Called once per request since D1 is request-scoped.
export const makeAppLayer = (env: Env) => {
  // Provide the raw D1 binding into the Effect context
  const D1Live = Layer.succeed(D1DatabaseTag, env.DB);

  // Infrastructure layers — each implements a port interface
  const RepositoryLayer = Layer.mergeAll(D1UserRepositoryLive).pipe(
    Layer.provide(D1Live),
  );

  // Application layer — depends on infrastructure ports
  const AppServiceLayer = UserService.Default.pipe(
    Layer.provide(Layer.mergeAll(RepositoryLayer)),
  );

  return Layer.mergeAll(AppServiceLayer, RepositoryLayer);
};

// The services provided by the app layer (e.g. UserRepository | UserService)
export type AppServices = Layer.Layer.Success<ReturnType<typeof makeAppLayer>>;
