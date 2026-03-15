import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { Effect, Schema } from "effect";

import { listen } from "./listen";

// Define the schema for route parameters
const Params = Schema.Struct({
  userId: Schema.String,
  bookId: Schema.String,
});

// Create a router with a route that captures parameters
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.text("Hello, World!")),
  HttpRouter.get(
    "/users/:userId/books/:bookId",
    HttpRouter.schemaPathParams(Params).pipe(
      Effect.flatMap((params) => HttpServerResponse.json(params)),
    ),
  ),
);

const app = router.pipe(HttpServer.serve());

listen(app, 3000);

console.log("Server is running on http://localhost:3000");
