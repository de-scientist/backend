# Migration: Prisma -> Drizzle

This document explains what I changed to migrate the backend from Prisma to Drizzle, why the changes were made, how to run the updated backend, and gotchas/troubleshooting tips.

## Summary

- Replaced runtime DB access from `@prisma/client` to `drizzle-orm` using a `pg` pool.
- Added Drizzle table definitions translated from `prisma/schema.prisma`.
- Converted controllers and middleware (both TypeScript and CommonJS JS files) to use `db` and Drizzle queries.
- Converted the seeding script to use Drizzle and added UUID/timestamp handling for inserts.
- Left Prisma schema/migrations in place for now (can be removed after verification).

## What was added/changed (high level)

- `package.json`
  - Added `drizzle-orm` (pinned to a published version) and `pg`.
  - Removed/disabled `drizzle-kit` install and made drizzle migration scripts no-ops (install manually if you want drizzle-kit).

- `src/config/drizzle.ts`
  - New Drizzle client using `pg.Pool` and `drizzle-orm/node-postgres`.
  - Exports both the `db` instance and the `pool` (used by seed script).

- `src/db/schema.ts`
  - Table definitions translated from `prisma/schema.prisma` (tables: `users`, `events`, `ministries`, `prayer_requests`, `newsletter_subscriptions`, `contact_submissions`, `executive_members`, `media`).
  - Column names use the actual DB column names (this project previously used Prisma which created camelCase column names like `isActive`, `createdAt`). The Drizzle table columns reflect that.

- `src/config/env.ts`
  - Reintroduced a default export object and named exports (e.g. `jwtSecret`) so both ESM `import env from` and CommonJS `require('../config/env')` continue to work.

- `prisma/seed.ts`
  - Converted to use the Drizzle `db` for inserts and selects.
  - Generates `id` with `crypto.randomUUID()` for inserts and supplies `createdAt`/`updatedAt` values to satisfy NOT NULL constraints.
  - Removed explicit `pool.end()` call in favour of process-level cleanup handled in `drizzle.ts` (avoids double-close errors).

- Controllers & Middlewares
  - Converted core modules to use Drizzle (`auth`, `events`, `ministries`, `newsletter`, `prayer`, `contact`, `admin`) — both `.ts` and `.js` variants where present.
  - Replaced `prisma.xxx` calls with Drizzle `db.select()`, `db.insert()`, `db.update()`, `db.delete()`, and used `drizzle-orm` helpers like `eq` and `sql` where necessary.
  - Auth middleware now fetches user using Drizzle and sets `req.user` as before.

## Important implementation notes and reasoning

- Column naming: Prisma had created tables with camelCase column names (e.g., `isActive`, `createdAt`). The initial Drizzle schema used snake_case names (e.g., `is_active`) which caused SQL errors. I adjusted `src/db/schema.ts` to match the actual DB column names.
- UUIDs & timestamps: Prisma can add defaults at the DB level. When inserting via Drizzle (or when the DB lacks defaults), seed inserts failed due to NOT NULL constraints on `id`, `createdAt`, `updatedAt`. The seed script now generates `id` and supplies timestamps to avoid these failures.
- Pool lifecycle: Closing the pool twice caused `Called end on pool more than once`. I removed the manual `pool.end()` in the seed script and let the drizzle client/process shutdown handle it.
- Counts & aggregates: Prisma's `.count()` calls were replaced with Drizzle `sql`-based count queries or by using arrays' `.length` where appropriate. I used `sql` for safe aggregate counts in the admin dashboard controller.
- Transactions: This migration replaces simple CRUD calls — if you have multi-statement transactions in your app, you should wrap them with Drizzle transactions (not auto-converted).

## How to run the updated backend

1. Ensure `DATABASE_URL` is set (in `.env` or environment).
2. Install dependencies (already adjusted in `package.json`):

```bash
cd backend
npm install
```

3. Seed the database (one-time):

```bash
npm run seed
```

4. Start the dev server:

```bash
npm run dev
```

5. Test key endpoints:

- POST /api/auth/register (user registration)
- POST /api/auth/login (login)
- GET /api/events
- POST /api/events (admin)
- GET /api/ministries

## Files you may want to review or remove later

- `src/config/database.ts` — Prisma client initialization remains in the repo. Once you confirm Drizzle is fully functional, remove this file and uninstall Prisma (`@prisma/client`, `prisma`) and any Prisma generated artifacts.
- `prisma/` folder — schema and migrations are left in place for reference. Remove only after you're sure you will not need Prisma migrations.

## Common issues & troubleshooting

- Error: "does not provide an export named 'default'" — caused by `env` module not exporting a default; fixed by adding a default export in `src/config/env.ts`.
- Error: "column \"is_active\" does not exist" — Drizzle schema using snake_case while DB has camelCase columns. Align column names in `src/db/schema.ts` with the DB or alter DB columns.
- Error: "null value in column \"id\" of relation \"users\" violates not-null constraint" — DB expected `id` default/UUID not present; seed now provides `id` via `randomUUID()` and timestamps.
- Error: "Called end on pool more than once" — avoid calling `pool.end()` multiple times; rely on central pool lifecycle management.

## Next steps / recommendations

1. Manually test the main flows (auth, admin dashboard, events/ministry CRUD) and verify responses match previous behaviour.
2. If you want DB migrations under Drizzle, install a compatible `drizzle-kit` version (or follow the drizzle docs) and generate migrations from `src/db/schema.ts`.
3. After verification, remove Prisma packages and `src/config/database.ts`:

```bash
cd backend
npm uninstall prisma @prisma/client
git rm src/config/database.ts
```

4. Optionally convert remaining code that still imports or references Prisma.

## Offer

If you want, I can:

- Run the dev server and walk through failing endpoints and fix issues.
- Remove Prisma and clean up leftover files.
- Add a `drizzle-kit` dev dependency and scaffold migration scripts.

If anything in this README should be expanded or you want me to continue with any of the next steps, tell me which action to run next.
