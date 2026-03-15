import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["https://tinderice-web.reubenmark.workers.dev", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (c) => c.text("Hello World"));

app.get("/api", (c) => c.text("API/Hello World"));

app.get("/api/items", (c) => c.json({ items: [] }));

export default app;