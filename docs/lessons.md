# Lessons learned — Themis Legal

This file grows over time. After every correction, add an entry here.
Claude reads this at the start of every session via CLAUDE.md.

## Format
```
## [YYYY-MM-DD] — Short description of the mistake
**What happened:** ...
**Rule added:** ...
**Where to find the fix:** ...
```

---

## [2026-04-29] — Server-side authorization for signing flow

**What happened:** Implemented CJ-624/625 signing experience. Critical to ensure both identity verification AND sequential order are checked server-side on both GET and POST endpoints.

**Rule added:** 
- Always verify signer identity (email match) server-side on both GET and POST
- Always verify sequential signing order server-side on both GET and POST
- Never trust client-side authorization checks
- Both endpoints must independently validate authorization
- Identity check: find signer where email matches session.user.email (case-insensitive)
- Sequential check: verify all signers with order < currentSigner.order have status = 'SIGNED'

**Where to find the fix:**
- `app/api/workflows/[id]/route.ts` (GET endpoint with auth checks)
- `app/api/workflows/[id]/sign/route.ts` (POST endpoint with same auth checks)
- Both check: currentSigner exists AND all previous signers have status='SIGNED'
- Return 403 with helpful message if not authorized or not their turn

---

## [2026-04-29] — AuditLog workflowId must be optional for auth events

**What happened:** Implemented CJ-630 audit trail completeness. Discovered that AUTH_SUCCESS events (required by legal-compliance.md) cannot reference a workflow since authentication happens before workflow context exists.

**Rule added:**
- AuditLog.workflowId is optional (String?) to support auth events
- Auth events (AUTH_SUCCESS, AUTH_FAILURE) have no workflow context → pass null
- Workflow-related events always pass the workflowId
- AUTH_SUCCESS is logged in Better Auth signIn callback with: workflowId=null, eventType='AUTH_SUCCESS', metadata includes email and provider
- Use `prisma db push` when shadow database is out of sync (faster than resolving migrate issues)

**Where to find the fix:**
- `prisma/schema.prisma` — AuditLog.workflowId changed from `String` to `String?`
- `lib/audit.ts` — writeAuditLog() accepts `workflowId: string | null`
- `lib/auth.ts` — signIn callback writes AUTH_SUCCESS audit log with workflowId=null
- `app/api/workflows/[id]/audit/route.ts` — new endpoint for workflow-specific audit trail

---

## [2026-04-29] — Signature field position percentages and Y-axis inversion

**What happened:** Implemented CJ-623 signature field placement with drag & drop on PDF. Field positions are stored as percentages (0-100) of page dimensions in the database, but pdf-lib uses a bottom-left origin coordinate system instead of top-left.

**Rule added:**
- Store field positions as percentages (0-100) of page width/height in SignatureField table
- x=0, y=0 represents the TOP-LEFT corner of the page (user-facing coordinate system)
- width and height are also stored as percentages of page dimensions
- When embedding signatures with pdf-lib, Y-axis must be inverted because pdf-lib uses bottom-left origin:
  - `pdfY = pageHeight - (y/100 * pageHeight) - (height/100 * pageHeight)`
  - X-axis needs no conversion: `pdfX = (x/100 * pageWidth)`
- Default field sizes: SIGNATURE (25% × 6%), INITIALS (12% × 6%), DATE (18% × 5%)

**Where to find the fix:**
- `app/workflows/[id]/place-fields/page.tsx` — field placement UI using top-left percentages
- `app/api/workflows/[id]/fields/route.ts` — saves field positions as percentages
- `prisma/schema.prisma` — SignatureField.x, y, width, height are Float (percentages)
- Future: When implementing PDF embedding, remember Y-axis inversion formula

---

## [2026-04-29] — Prisma migrations must be explicitly deployed to Neon

**What happened:** After creating Prisma migrations locally with `prisma migrate dev`, the schema changes were not applied to the remote Neon database. The workflow tables (Workflow, Signer, SignatureField, AuditLog, DriveSettings) were missing from production.

**Rule added:**
- `prisma migrate dev` creates migration files locally but does NOT automatically apply them to remote databases
- Always run `npx prisma migrate deploy` after creating new migrations to apply them to production/staging
- For quick schema syncs during development, use `npx prisma db push` (bypasses migration files)
- Neon pooled connections require `directUrl` in `prisma.config.ts` for migrations to work
- In Prisma 7+, table names are case-sensitive — existing Better Auth tables were lowercase (`user`, `account`) but migrations expected uppercase (`User`, `Account`)

**Where to find the fix:**
- `prisma.config.ts` — added `directUrl: process.env.DATABASE_URL_UNPOOLED` to datasource config
- Manual SQL execution to create workflow tables while preserving existing Better Auth tables
- Foreign keys reference lowercase `user` table to match existing schema

---

## [2026-04-29] — pdf-lib page index is 0-based, DB stores 1-based

**What happened:** Signatures were not appearing in signed PDFs. embedSignaturesInPdf() called pdfDoc.getPage(sig.page) but pdf-lib is 0-indexed while the place-fields UI stores pages as 1-indexed. For single-page docs, getPage(1) throws out-of-bounds, caught silently.

**Rule added:** Always use pdfDoc.getPage(sig.page - 1) when sig.page comes from DB.

**Where to find the fix:** lib/pdf.ts

---

## [2026-04-29] — pointerEvents:none on overlay blocks all subsequent field placement

**What happened:** After placing the first signature field, no more fields could be placed. The click overlay had pointerEvents:none when placedFields.length > 0, disabling all clicks after the first field.

**Rule added:** Remove the overlay div entirely. Move onClick={handlePageClick} to the parent container div. Existing fields sit above it in z-order so drag events still work.

**Where to find the fix:** app/workflows/[id]/place-fields/page.tsx

---

## [2026-04-30] — Use HTML5 Drag API for drag-and-drop, never manual mousemove

**What happened:** Custom mousemove-based drag tracking failed repeatedly due to stale closures in useEffect and inconsistent getBoundingClientRect references. Took many attempts before switching to the HTML5 Drag API.

**Rule added:**
- Use `draggable={true}` + `onDragStart` + `onDragOver` + `onDrop` for all drag-and-drop
- Store drag offset in dataTransfer to prevent fields from jumping to cursor position
- Query canvas rect fresh on every drop event (never cache rect in state/ref)
- This is the industry standard approach (DocuSign/HelloSign use the same)
- Never use manual mousemove/mouseup event listeners for drag — they create stale closure bugs

**Where to find the fix:**
- `app/workflows/[id]/place-fields/page.tsx` — HTML5 drag API implementation
- Field divs: `draggable={true}`, `onDragStart` stores fieldId and offset
- Container: `onDragOver` prevents default, `onDrop` calculates new position with fresh rect

---

## [2026-06-11] — Google Drive scope must include full access for shared files

**What happened:** Initial implementation used restrictive `drive.readonly` + `drive.file` scopes. This prevented users from seeing "Shared with me" files and Shared Drive documents. Additionally, `drive.file` only allows writing to app-created folders, not user-specified destinations for signed PDFs.

**Rule added:**
- Use full `https://www.googleapis.com/auth/drive` scope (industry standard for e-signature platforms)
- **CRITICAL:** `supportsAllDrives: true` must be added to EVERY Drive API operation involving shared drive files — not just list queries
  - `drive.files.list()` calls must include:
    - `corpora: 'user,allDrives'` — include My Drive and Shared Drives
    - `includeItemsFromAllDrives: true` — include files from shared drives
    - `supportsAllDrives: true` — enable shared drive support
  - `drive.files.get()` calls must include:
    - `supportsAllDrives: true` — even for single-file fetches
  - `drive.files.create()`, `drive.files.update()`, and ALL other file operations must include `supportsAllDrives: true`
- Without these parameters, shared files will appear in listings but return 404 "File not found" when accessed

**Where to find the fix:**
- `lib/auth.ts` — Google OAuth scope changed to full `drive` access
- `.claude/skills/google-drive.md` — updated all query examples with shared drive parameters
- `app/api/drive/files/route.ts` — file listing with shared drive support
- `app/api/drive/files/[fileId]/route.ts` — single file metadata fetch with `supportsAllDrives: true`
- `app/api/drive/files/[fileId]/hash/route.ts` — hash computation with `supportsAllDrives: true` (2 calls)
- `app/api/drive/files/[fileId]/pdf/route.ts` — PDF streaming with `supportsAllDrives: true` (2 calls)

**Why this is safe:**
- DocuSign, HelloSign, PandaDoc all use the same full Drive scope
- Users understand why document signing needs Drive access
- We never modify or delete original files (read-only for source, write only for signed output)
- Audit logs track all file access

---

## [2026-06-18] — Google OAuth needs offline access + bulletproof server-side refresh

**What happened:** After ~1 hour (typically overnight), "Failed to load Drive files" appeared in the new-workflow FilePicker, and signers couldn't load documents either. Two root causes: (1) the Google provider in `lib/auth.ts` never set `accessType: 'offline'`, so Google returned NO refresh token — the access token expired with nothing to refresh it. (2) `lib/drive.ts` only refreshed when `accessTokenExpiresAt && accessTokenExpiresAt < now`, so a null expiry silently skipped refresh, and there was no buffer for tokens about to expire mid-request.

**Why this matters for signers:** Signers read the document via the CREATOR's token (`getDriveClient(workflow.creatorId)`), so a stale creator token blocks the signer through no fault of their own. Refresh MUST be automatic and server-side.

**Rule added:**
- Google provider must set `accessType: 'offline'` AND `prompt: 'consent'` (the latter forces a refresh token even for users who already consented once).
- `getDriveClient` refreshes proactively: if token is expired, expiring within a 5-min buffer, OR has no expiry on record.
- Refreshed tokens are persisted to the `account` row so concurrent/subsequent requests reuse them.
- If no refresh token exists or refresh fails (revoked), throw `DRIVE_REAUTH_REQUIRED` — a distinguishable sentinel.
- Creator-facing routes (`/api/drive/files`, `/api/drive/search`) map `DRIVE_REAUTH_REQUIRED` → 401 so the FilePicker shows a "Reconnect Google Drive" button.
- Signer-facing routes (`/api/drive/files/[fileId]/pdf` and `/hash`) map it → 502 with `code: 'OWNER_REAUTH_REQUIRED'` and a message telling the signer to contact the document owner (the signer cannot fix the creator's token).

**Unavoidable one-time step:** accounts that authenticated BEFORE this fix have no refresh token stored. No code can refresh them automatically — they must reconnect Google once. After that, refresh is fully automatic.

**Where to find the fix:**
- `lib/auth.ts` — `accessType: 'offline'`, `prompt: 'consent'` on Google provider
- `lib/drive.ts` — buffer-based proactive refresh + `DRIVE_REAUTH_REQUIRED` sentinel
- `components/drive/FilePicker.tsx` — 401/403 → reconnect button via `signIn.social`
- `app/api/drive/files/route.ts`, `app/api/drive/search/route.ts` — map sentinel → 401
- `app/api/drive/files/[fileId]/pdf/route.ts`, `.../hash/route.ts` — map sentinel → 502 OWNER_REAUTH_REQUIRED
