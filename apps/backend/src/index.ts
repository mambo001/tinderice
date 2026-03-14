import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { SampleType } from "@tinderice-app/shared";

// Define the router with a single route for the root URL
const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.text("Hello World")),
);

// Set up the application server with logging
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// Specify the port
const port = 3000;

// Create a server layer with the specified port
const ServerLive = BunHttpServer.layer({ port });

// Run the application
BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));

/*
Output:
timestamp=... level=INFO fiber=#0 message="Listening on http://localhost:3000"
*/
