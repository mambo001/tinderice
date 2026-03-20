import { ExecutionContext, ExportedHandler } from "@cloudflare/workers-types";

import app from "./app";
import type { Env } from "./shared/config/env";

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
