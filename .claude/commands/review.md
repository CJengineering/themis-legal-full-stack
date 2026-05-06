# /review command
# Usage: /review  or  /review src/app/api/workflows/route.ts

Review $ARGUMENTS as a senior engineer on Themis Legal.

Check in this order:
1. **Auth** — does every API route call getServerSession() and return 401 if missing?
2. **Audit log** — does every signing event write to audit_log?
3. **Drive storage** — is any Drive file content being stored in DB or buffered in memory?
4. **Sequential signing** — is signer order enforced server-side?
5. **TypeScript** — any `any` types or unsafe `as` casts?
6. **Secrets** — any hardcoded tokens, API keys, or credentials?
7. **Error handling** — are Drive API errors (401, 403, 404) handled explicitly?
8. **Transaction safety** — are multi-step DB writes wrapped in prisma.$transaction()?

Report findings grouped as: 🔴 Critical / 🟡 High / 🔵 Medium
Do not approve until all Critical issues are resolved.
