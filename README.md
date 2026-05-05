# Vibe Voicer

Receipts, but make it nice. A small invoice app for freelancers — clients, line items, PDF export, and a public share link per invoice.

## Stack

- **Next.js 16** (App Router, Turbopack) on **React 19**
- **TypeScript**, strict
- **Tailwind v4** via `@tailwindcss/postcss` (no `tailwind.config.ts` — tokens live in `src/app/globals.css`)
- **shadcn/ui** primitives, **Radix** under the hood
- **react-hook-form** + **zod**
- **Better Auth** with the Prisma adapter — email/password and optional Google/GitHub OAuth
- **Prisma 6** against **PostgreSQL**
- **@react-pdf/renderer** for invoice PDFs
- **sonner** for toasts

## Getting started

Prereqs: Node 20+, pnpm, a Postgres database.

```bash
pnpm install
cp env.example .env.local   # fill in DATABASE_URL + BETTER_AUTH_SECRET
pnpm db:push                # sync the schema
pnpm db:seed                # optional — sample clients/invoices
pnpm dev
```

Then open <http://localhost:3000>.

### Required env vars

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Session signing secret |
| `BETTER_AUTH_URL` | Public origin (defaults to `http://localhost:3000`) |
| `TRUSTED_ORIGINS` | Comma-separated list, merged into Better Auth's trusted origins |

### Optional OAuth

Set both halves of a pair to enable a provider; leave them blank to hide it from the sign-in screen.

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

There is no transactional email provider wired up. Signup is immediate — there is no verification email step and no password-reset-by-email flow. Authenticated users can change their password from `/settings`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server (Turbopack) |
| `pnpm build` | `prisma generate` + `next build --turbopack` |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint (`next/core-web-vitals` + `next/typescript`) |
| `pnpm db:push` | Sync schema without a migration |
| `pnpm db:migrate` | Create + apply a dev migration |
| `pnpm db:seed` | `tsx prisma/seed.ts` |
| `pnpm db:studio` | Prisma Studio |

There is no test runner configured.

## Project layout

```
src/
├── app/                 # App Router routes
│   ├── (marketing)      # /, /about, /features, /pricing, /privacy, /terms
│   ├── login, register  # auth screens
│   ├── dashboard        # authed home
│   ├── clients          # client CRUD
│   ├── invoices         # invoice CRUD + PDF
│   ├── settings         # profile, password, invoice defaults
│   ├── i/[slug]         # public invoice share (no auth)
│   └── api/             # route handlers (Better Auth, clients, invoices, settings, health)
├── components/          # UI + PDF renderers
│   └── ui/              # shadcn primitives
├── lib/                 # auth, db singleton, helpers
└── proxy.ts             # auth gate for /dashboard (Next 16 middleware)
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Deployment

Configured for Vercel (`vercel.json` pins Node, install, and build). Push to a branch and connect the repo, or run `vercel`. Set every env var listed above in the project before the first deploy.

## License

MIT — see `LICENSE`.
