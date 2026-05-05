# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (lockfile is `pnpm-lock.yaml`).

- `pnpm dev` — Next.js dev server with Turbopack
- `pnpm build` — runs `prisma generate` then `next build --turbopack`
- `pnpm lint` — ESLint (`next/core-web-vitals` + `next/typescript`)
- `pnpm db:push` — sync schema to DB without a migration (fast iteration)
- `pnpm db:migrate` — create + apply a dev migration
- `pnpm db:seed` — runs `tsx prisma/seed.ts`
- `pnpm db:studio` — Prisma Studio

There is no test runner configured. Don't claim "tests pass" — there are none.

## Architecture

**Next.js 16 App Router** under `src/app/`. Route groups:
- Public marketing/legal: `/`, `/about`, `/features`, `/pricing`, `/privacy`, `/terms`
- Auth: `/login`, `/register` — email/password + optional Google/GitHub OAuth
- Authenticated app: `/dashboard`, `/clients`, `/invoices`, `/settings` — wrapped in `src/components/protected-layout.tsx`
- **Public invoice share**: `/i/[slug]` resolves `Invoice.publicSlug` and renders without auth

**API routes** (`src/app/api/`) follow a fixed pattern: call `auth.api.getSession({ headers: request.headers })`, return 401 if absent, then scope all Prisma queries by `session.user.id`. The auth handler is mounted at `src/app/api/auth/[...all]/`. Money fields are Prisma `Decimal` — API routes manually serialize them to numbers before returning JSON; preserve that when adding new endpoints.

**Auth** (`src/lib/auth.ts`) is **Better Auth** with the Prisma adapter. Session/User/Account/Verification models live in `prisma/schema.prisma` alongside the domain models. There is **no transactional email provider wired up** — email verification and password reset are intentionally disabled. Signup completes immediately and lands the user on `/dashboard`. If you re-introduce email, also re-enable `requireEmailVerification` and the `sendResetPassword` / `sendVerificationEmail` callbacks. Google + GitHub social providers are conditionally enabled based on `*_CLIENT_ID` / `*_CLIENT_SECRET` env vars; they silently disappear when unset. `baseURL` defaults to `https://www.j-designs.org` in production. `TRUSTED_ORIGINS` is a comma-separated env var merged into the trusted-origins list.

**Database singleton** (`src/lib/db.ts`): always import `{ db }` from `@/lib/db` — do not instantiate `new PrismaClient()` in route handlers. The schema targets **PostgreSQL** (`DATABASE_URL`).

**Edge auth gate** lives in `src/proxy.ts` (Next 16's renamed middleware convention). It only protects `/dashboard/:path*` and redirects unauthenticated users to `/login`.

**PDF generation**: two renderer variants in `src/components/` — `black-white-invoice-pdf.tsx` and `simple-invoice-pdf.tsx` — both using `@react-pdf/renderer`. Pick one based on the requested template; don't add a third without checking which is used where.

**Path alias**: `@/*` → `src/*`.

## Conventions

- TypeScript strict patterns: no `any`, no non-null `!`, no unsafe `as` casts, no empty `catch {}`. Narrow with `unknown` + type guards.
- Tailwind v4 via `@tailwindcss/postcss` — there is **no `tailwind.config.ts`**; theme tokens live in `src/app/globals.css`.
- shadcn/ui is configured (`components.json`); add new primitives via `pnpm dlx shadcn@latest add <component>` rather than hand-rolling them.
- Forms use `react-hook-form` + `zod` via `@hookform/resolvers`.
- Toasts: `sonner` (preferred) — `@radix-ui/react-toast` is also installed but new code should use sonner.
