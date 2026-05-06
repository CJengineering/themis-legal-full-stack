# Themis Legal — Claude Code context

## What this is
E-signature platform. Workflow Creators build signing workflows from Google
Drive documents. Signers authenticate then sign in sequential order.
**Themis never stores document files** — it orchestrates via Google Drive API only.

See @docs/architecture.md for system overview.
See @docs/lessons.md for past corrections — read before coding.

## Stack

- API layer: tRPC v11
- Database: PostgreSQL via Prisma ORM
- Auth: Better AUth
- Storage: Google Drive API only — no S3, no local file storage
- Email: Resend
- UI: FOLLOW the existing

## Commands
- `pnpm dev` — start dev server (port 3000)
- `pnpm build` — production build
- `pnpm typecheck` — run tsc --noEmit (run after EVERY change)
- `pnpm test` — Jest unit tests
- `pnpm test:e2e` — Playwright end-to-end tests
- `pnpm db:migrate` — apply Prisma migrations
- `pnpm db:studio` — open Prisma Studio
- `pnpm lint` — ESLint

## Non-negotiable rules — IMPORTANT
- No `any` types. No `as` casts without an explanatory comment.
- No raw SQL — all DB access through Prisma only.
- No secrets or tokens hardcoded anywhere — use `.env.local` only.
- No storing Google Drive file content in our DB or memory beyond one request.
- Every signing event MUST write a row to `audit_log` — no exceptions.
- Every API route MUST call `getServerSession()` and return 401 if no session.
- Sequential signing order is enforced server-side — never trust client order.
- Run `pnpm typecheck` before considering any task complete.

## Task workflow
1. Write plan to `tasks/todo.md` before coding
2. Check in with me before starting implementation
3. Mark tasks complete as you go
4. After any correction: add the lesson to `docs/lessons.md`

## Skills — load these on demand, not all at once
- Auth & session patterns → @.claude/skills/auth.md
- Google Drive integration → @.claude/skills/google-drive.md
- Signing flow logic → @.claude/skills/signing-flow.md
- Legal compliance & audit trail → @.claude/skills/legal-compliance.md
- Database schema reference → @.claude/skills/db-schema.md
