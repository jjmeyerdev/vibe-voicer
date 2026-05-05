# vibe-voicer

Codex-facing project instructions. Mirror of `CLAUDE.md` for Codex / OpenAI Agents SDK compatibility. Inherits from the canonical rules at `~/Developer/Obsidian/The Vault/_personal/agent-os/claude.md`.

## Purpose

(fill in)

## Environment

- OS: macOS
- Shell: fish
- Package manager: pnpm
- Node version: (unset)
- Language/stack: TypeScript / Next.js

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev` (Next.js + Turbopack)
- Build: `pnpm build` (runs `prisma generate` then `next build --turbopack`)
- Start: `pnpm start`
- Lint: `pnpm lint`
- DB push (no migration): `pnpm db:push`
- DB migrate (dev): `pnpm db:migrate`
- DB seed: `pnpm db:seed`
- DB studio: `pnpm db:studio`

No test runner, typechecker script, or formatter is wired up in this repo. Don't claim "tests pass" or run `pnpm test` / `pnpm typecheck` / `pnpm format` — they don't exist.

## Rules

- TypeScript strict: no `any`, no non-null assertions, no unjustified casts.
- Verify `git config user.email` matches the expected identity before committing.
- Output: plans in `docs/plans/`, reports in `docs/reports/`, scratch in `.tmp/`.
- Ask before destructive ops (rm, force-push, branch -D, removing dependencies).
- Batched verification: one preflight, batched edits, one final check.

## Project-specific overrides

- (Add anything that diverges from the canonical rules.)
