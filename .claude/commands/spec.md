# /spec command
# Usage: /spec CJ-614  or  /spec "Google Drive file picker"

Interview me about $ARGUMENTS using the AskUserQuestion tool.

Ask about:
- What already exists in the UI (I have a built UI — ask what's done)
- Exact API shape needed (request/response)
- Edge cases and error states specific to Themis (e.g. Drive auth expiry, wrong signer email)
- DB changes required (new tables, columns, migrations)
- Audit log events this feature needs to emit
- How this connects to the sequential signing order
- Legal/compliance considerations if signing-related

Don't ask obvious questions. Dig into the hard parts.
Keep interviewing until we've covered everything.
Then write a complete spec to `tasks/specs/$ARGUMENTS.md`.
Include: goal, API routes, DB changes, audit events, acceptance criteria mapped to Linear issue.
Once spec is written, tell me to start a fresh session to implement it.
