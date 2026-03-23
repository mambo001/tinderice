import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: [
    "https://tinderice-web.reubenmark.workers.dev",
    "http://localhost:5173",
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Client-ID"],
  credentials: true,
});