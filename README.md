# 🍚 Tinderice

> Your rice's perfect match. Swipe through Filipino dishes and instantly discover what to pair with your next rice meal.

**[Live Demo →](https://tinderice.reubenmark.workers.dev/)**

---

## What it is

Tinderice is a Tinder-style swipe app for Filipino food. Users swipe through dish cards and get instant rice pairing suggestions — built as a fun, full-stack side project exploring edge-native deployment and functional TypeScript.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Backend | Hono on Cloudflare Workers |
| Shared | TypeScript monorepo (`packages/shared`) |
| Runtime | Bun |
| Deploy | Cloudflare Workers (frontend + backend) |
| Testing | Vitest + `@effect/vitest` |

### A note on Effect-TS

The backend uses [Effect](https://effect.website/) — a TypeScript library for writing type-safe, composable, and highly explicit server-side logic. It brings structured error handling, dependency injection via `Context.Tag`, and `Layer`-based service wiring to the codebase, without sacrificing TypeScript's type system.

## Project Structure

```
tinderice/
├── apps/
│   ├── web/          # React frontend (Vite + Cloudflare Workers)
│   └── backend/      # Hono API (Effect-TS, Cloudflare Workers)
├── packages/
│   └── shared/       # Shared types and schemas
├── package.json      # Bun workspaces
└── tsconfig.base.json
```

## Quick Start

Requires [Bun](https://bun.sh/) and a [Cloudflare](https://developers.cloudflare.com/workers/) account for deployment.

```bash
# Install dependencies
bun install

# Run all apps in dev mode
bun dev
```

To deploy:

```bash
bun run deploy
```

This builds both apps and deploys them via Wrangler to Cloudflare Workers.

## License

MIT
