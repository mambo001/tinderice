// import { describe, it, expect } from "vitest";
// import { Effect, Layer } from "effect";
// import { User } from "@/domain/entities";
// import { UserId } from "@/domain/entities/user-id.value";
// import { D1DatabaseTag } from "@/shared/config/env";
// import { D1UserRepositoryLive } from "@/infra/repositories/cloudflare/d1-user-repository";
// import { UserNotFoundError, DatabaseError } from "@/domain/errors";

// // In-memory mock of D1Database
// const makeTestD1 = () => {
//   const store = new Map<string, any>();

//   return {
//     store,
//     db: {
//       prepare: (query: string) => ({
//         bind: (...args: any[]) => ({
//           first: async <T>(): Promise<T | null> => {
//             const id = args[0];
//             return (store.get(String(id)) as T) ?? null;
//           },
//           run: async () => {
//             if (query.startsWith("INSERT")) {
//               const [id, name, email] = args;
//               store.set(String(id), {
//                 id: String(id),
//                 name,
//                 email,
//                 created_at: new Date().toISOString(),
//                 updated_at: new Date().toISOString(),
//               });
//             }
//             if (query.startsWith("DELETE")) {
//               store.delete(String(args[0]));
//             }
//             return { success: true };
//           },
//           all: async () => ({ results: Array.from(store.values()) }),
//         }),
//       }),
//       batch: async () => [],
//       dump: async () => new ArrayBuffer(0),
//       exec: async () => ({ count: 0, duration: 0 }),
//     },
//   };
// };

// describe("D1UserRepository", () => {
//   const setup = () => {
//     const { db, store } = makeTestD1();
//     const testD1Layer = Layer.succeed(D1DatabaseTag, db);
//     const repoLayer = D1UserRepositoryLive.pipe(Layer.provide(testD1Layer));
//     return { store, repoLayer, testD1Layer };
//   };

//   describe("save", () => {
//     it("should insert a new user", async () => {
//       const { store, repoLayer } = setup();

//       const program = Effect.gen(function* () {
//         const repo = yield* D1UserRepositoryLive;
//         const user = {
//           id: UserId.make("test-id-1"),
//           name: "Alice",
//           email: "alice@example.com",
//         } as User;

//         yield* repo.save(user);
//       });

//       await Effect.runPromise(program.pipe(Effect.provide(repoLayer)));

//       expect(store.has("test-id-1")).toBe(true);
//       expect(store.get("test-id-1")).toMatchObject({
//         name: "Alice",
//         email: "alice@example.com",
//       });
//     });
//   });

//   describe("findById", () => {
//     it("should return a user when found", async () => {
//       const { store, repoLayer } = setup();

//       // Pre-populate the store
//       store.set("test-id-2", {
//         id: "test-id-2",
//         name: "Bob",
//         email: "bob@example.com",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       });

//       const program = Effect.gen(function* () {
//         const repo = yield* D1UserRepositoryLive;
//         return yield* repo.findById(UserId.make("test-id-2"));
//       });

//       const user = await Effect.runPromise(
//         program.pipe(Effect.provide(repoLayer)),
//       );

//       expect(user.name).toBe("Bob");
//       expect(user.email).toBe("bob@example.com");
//     });

//     it("should fail with UserNotFoundError when user does not exist", async () => {
//       const { repoLayer } = setup();

//       const program = Effect.gen(function* () {
//         const repo = yield* D1UserRepositoryLive;
//         return yield* repo.findById(UserId.make("nonexistent"));
//       });

//       const result = await Effect.runPromiseExit(
//         program.pipe(Effect.provide(repoLayer)),
//       );

//       expect(result._tag).toBe("Failure");
//     });
//   });

//   describe("delete", () => {
//     it("should remove a user from the store", async () => {
//       const { store, repoLayer } = setup();

//       store.set("test-id-3", {
//         id: "test-id-3",
//         name: "Charlie",
//         email: "charlie@example.com",
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       });

//       const program = Effect.gen(function* () {
//         const repo = yield* D1UserRepositoryLive;
//         yield* repo.delete(UserId.make("test-id-3"));
//       });

//       await Effect.runPromise(program.pipe(Effect.provide(repoLayer)));

//       expect(store.has("test-id-3")).toBe(false);
//     });
//   });
// });
