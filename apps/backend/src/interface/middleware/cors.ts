import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: ["https://tinderice.reubenmark.workers.dev", "http://localhost:5173"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Client-ID",
    "x-room-id",
    "x-user-id",
    "x-owner-id",
  ],
  credentials: true,
});
