# Themis Legal — Sprint Progress Report

**Generated:** 2026-04-16  
**Codebase Status:** Active development  
**Database:** PostgreSQL via Prisma — schema complete and migrated

---

## Executive Summary

**Overall Progress:** Sprint 1 Foundation complete. Sprint 2 Workflow Creation in progress — dashboard and list pages wired to real data, but workflow creation wizard and detail pages still using dummy data.

**Critical Path Blockers:**
1. **Workflow creation flow** (CJ-621, CJ-622, CJ-623) — needs API endpoints
2. **Signing experience** (CJ-624, CJ-625) — core signing flow not started
3. **Email notifications** (CJ-627) — required for workflow progression

**API Maturity:**
- ✅ Auth & session management (Better Auth)
- ✅ Google Drive integration (browse, search)
- ✅ Workflow listing & stats
- ✅ Signer inbox
- 🔴 Workflow CRUD operations (POST, PATCH, DELETE)
- 🔴 Signing submission
- 🔴 Email notifications
- 🔴 Audit log API

---

## Sprint 1 — Foundation & Auth

### CJ-632: Better Auth (Google + Microsoft OAuth, allowlist)
**Status:** ✅ Done  
**What's working:**
- Google OAuth integration via Better Auth
- Microsoft OAuth integration via Better Auth
- Email allowlist enforced in `lib/auth.ts` (checks against `AUTHORIZED_EMAILS` env var)
- Session management with PostgreSQL-backed sessions
- Protected routes via `auth.api.getSession()` middleware
- Login page at `app/(auth)/login/page.tsx`

**What's missing:**
- Nothing — auth is fully functional

**Blocking dependencies:**
- None

**Files:**
- `lib/auth.ts` — Better Auth config
- `lib/auth-client.ts` — client-side hooks
- `app/(auth)/login/page.tsx` — login UI
- `app/api/auth/[...all]/route.ts` — auth API routes

---

### CJ-616: Connect Google Drive
**Status:** ✅ Done  
**What's working:**
- Drive API client initialization in `lib/drive.ts`
- OAuth tokens stored in `Account` table (Better Auth)
- Token refresh logic when access token expires
- Drive scopes: `drive.file` (read/write files app creates)

**What's missing:**
- Nothing — connection logic complete

**Blocking dependencies:**
- None

**Files:**
- `lib/drive.ts` — Drive client factory using user's OAuth tokens
- `app/api/drive/connect/route.ts` — connection endpoint

---

### CJ-617: Browse Drive files
**Status:** ✅ Done (just completed today)  
**What's working:**
- `GET /api/drive/files?folderId={id}` — list folder contents (or root if no folderId)
- `GET /api/drive/search?q={query}` — search files by name
- Frontend at `app/drive/page.tsx` wired to real API
- Folder navigation with breadcrumb trail
- Search with 300ms debounce
- Filters to PDF/DOCX files only
- Loading, error, and empty states

**What's missing:**
- Nothing — fully functional

**Blocking dependencies:**
- None

**Files:**
- `app/api/drive/files/route.ts` — list files/folders
- `app/api/drive/search/route.ts` — search endpoint
- `app/drive/page.tsx` — Drive browser UI (wired to real data)

---

## Sprint 2 — Workflow Creation

### CJ-618: Dashboard wired to real data
**Status:** ✅ Done  
**What's working:**
- Root page (`app/page.tsx`) is the authenticated dashboard
- Fetches stats from `GET /api/workflows/stats` (active, awaiting, completed, your turn)
- Fetches recent workflows from `GET /api/workflows` (top 10, ordered by updatedAt DESC)
- Stats cards component (`components/stats-cards.tsx`) receives real props
- Workflow cards show real data: title, status, signers, progress
- Auth check: redirects to `/login` if no session

**What's missing:**
- Nothing — dashboard fully wired

**Blocking dependencies:**
- None

**Files:**
- `app/page.tsx` — dashboard (server component, fetches real data)
- `app/api/workflows/route.ts` — `GET /api/workflows` (lists workflows where user is creator OR signer)
- `app/api/workflows/stats/route.ts` — `GET /api/workflows/stats` (aggregate counts)
- `components/stats-cards.tsx` — stats display (real props)
- `components/workflow-card.tsx` — workflow card component

**Note:** `app/dashboard/page.tsx` now redirects to `/` (root is canonical dashboard)

---

### CJ-619: Workflows page wired to real data
**Status:** ✅ Done  
**What's working:**
- `app/workflows/page.tsx` fetches from `GET /api/workflows`
- Displays workflows in tabs: All, Your Turn, Awaiting Others, Completed
- Search filter (client-side)
- Real-time calculation of "your turn" status based on signer order
- Status badges: your_turn, in_progress, awaiting_signature, completed
- Progress bars show signed/total signers
- Links to workflow detail page and "View in Drive" (Drive link not yet functional)

**What's missing:**
- **Cancel workflow** action — no API endpoint yet
- **Filter dropdown** — not wired (UI present but non-functional)
- **Sort dropdown** — not wired (UI present but non-functional)

**Blocking dependencies:**
- `DELETE /api/workflows/{id}` or `PATCH /api/workflows/{id}/cancel` for cancel action

**Files:**
- `app/workflows/page.tsx` — workflows list (wired to real data)
- `app/api/workflows/route.ts` — shared GET endpoint

---

### CJ-620: Remind, cancel, view completed doc
**Status:** 🟡 Partial  
**What's working:**
- Workflow detail page UI exists at `app/workflows/[id]/page.tsx`
- "View in Drive" button UI present
- "Download Signed Copy" button UI present
- "Send Reminder" button UI present
- "Cancel Workflow" button UI present

**What's missing:**
- **All functionality** — page still uses hardcoded `mockWorkflow` object
- No `GET /api/workflows/{id}` endpoint to fetch workflow detail
- No `POST /api/workflows/{id}/remind` endpoint
- No `PATCH /api/workflows/{id}/cancel` endpoint
- No download logic (needs to fetch signed file from Drive)
- Audit log display shows mock data

**Blocking dependencies:**
- `GET /api/workflows/{id}` with full joins (Workflow + Signers + AuditLog + creator)
- `POST /api/workflows/{id}/remind` to send reminder emails
- `PATCH /api/workflows/{id}/cancel` to cancel workflow
- `GET /api/drive/files/{fileId}/download` to download signed document
- Schema field `Workflow.retentionDate` exists but not populated

**Files:**
- `app/workflows/[id]/page.tsx` — workflow detail (DUMMY DATA)

---

### CJ-621: Document selection + workflow creation (POST /api/workflows)
**Status:** 🔴 Not started  
**What's working:**
- 4-step wizard UI exists at `app/workflows/new/page.tsx`
- Step 1: Document selection UI (file picker with breadcrumb navigation)
- Step 2: Add signers UI (search, drag to reorder)
- Step 3: Configure settings UI (retention date, notifications)
- Step 4: Review UI (summary before submission)

**What's missing:**
- **All backend logic** — wizard still uses `mockDriveFiles` and `mockTeamMembers`
- No integration with real Drive API (should use `/api/drive/files`)
- No `POST /api/workflows` endpoint to create workflow
- No document hash computation (SHA-256 of Drive file)
- No signer creation (bulk insert to `Signer` table)
- No audit log entry (`WORKFLOW_CREATED`)
- No email notification to first signer

**Blocking dependencies:**
- `POST /api/workflows` with payload:
  ```typescript
  {
    name: string
    driveFileId: string
    signers: Array<{ name, email, order }>
    retentionDate?: Date
    notifyOnSign: boolean
    notifyOnComplete: boolean
  }
  ```
- Document hash computation (fetch file from Drive, compute SHA-256)
- Email service integration (Resend) for first signer notification
- User lookup endpoint (`GET /api/users` to populate team members list)

**Files:**
- `app/workflows/new/page.tsx` — create workflow wizard (DUMMY DATA)

---

### CJ-622: Add/order/edit/remove signers
**Status:** 🔴 Not started  
**What's working:**
- Signer management UI exists in `app/workflows/new/page.tsx` Step 2
- Drag handles to reorder signers
- Remove signer button
- Add signer from team members list
- Search team members by name/email

**What's missing:**
- **All backend integration** — uses `mockTeamMembers` array
- No `GET /api/users` endpoint to fetch authorized users (allowlist)
- No validation that signers are on allowlist
- No ability to add external signers (email not in allowlist) — may be intentional per architecture

**Blocking dependencies:**
- `GET /api/users` to fetch allowlisted users
- Decision: Can external signers (not in allowlist) be added? If yes, they authenticate via magic link or can skip auth?

**Files:**
- `app/workflows/new/page.tsx` — Step 2 of wizard (DUMMY DATA)

---

### CJ-623: Signature field placement
**Status:** 🔴 Not started  
**What's working:**
- Nothing — signature field placement UI does not exist yet

**What's missing:**
- **Entire feature** — no UI to place signature fields on document
- No document preview/rendering (PDF.js or similar)
- No drag-and-drop field placement interface
- No field type selector (signature, initials, date)
- No assignment of fields to specific signers
- No storage of field positions in `SignatureField` table

**Blocking dependencies:**
- PDF rendering library (pdf.js or react-pdf)
- Field placement UI component (drag-and-drop on canvas)
- `SignatureField` creation logic (bulk insert after workflow creation)
- Decision: Where in the flow? Part of wizard Step 3 or separate page after workflow creation?

**Files:**
- None — feature not started

---

## Sprint 3 — Signing Experience

### CJ-624: Signer auth + identity verification
**Status:** 🔴 Not started  
**What's working:**
- Signing page UI exists at `app/sign/[workflowId]/page.tsx`
- Sequential order enforcement logic exists (client-side check)
- Session auth check exists (client-side)

**What's missing:**
- **All backend logic** — page uses `mockWorkflow` and `currentUser` hardcoded objects
- No `GET /api/workflows/{id}` endpoint with signer verification
- No server-side check that `session.user.email` matches a signer on this workflow
- No server-side check that previous signers have signed (sequential enforcement)
- No 403 response if user is not authorized to sign
- No audit log entry for `SIGNING_STARTED` event

**Blocking dependencies:**
- `GET /api/workflows/{id}` with signer join + auth check
- Sequential signing enforcement per `docs/lessons.md` and `.claude/skills/signing-flow.md`
- Server-side identity verification: `signer.email === session.user.email`

**Files:**
- `app/sign/[workflowId]/page.tsx` — signing experience (DUMMY DATA)

---

### CJ-625: Draw/type signature, consent, submit
**Status:** 🔴 Not started  
**What's working:**
- Signature pad component exists at `components/signature-pad.tsx` (draw/type/upload modes)
- Consent checkbox UI exists
- Submit button UI exists
- Document preview exists (mock HTML)

**What's missing:**
- **All backend submission logic** — no POST endpoint to submit signature
- No `POST /api/workflows/{workflowId}/sign` endpoint
- No base64 signature image storage
- No consent timestamp recording
- No atomic transaction per `.claude/skills/signing-flow.md`:
  1. Update signer status to `SIGNED`
  2. Write audit log entry (`FIELD_SIGNED`, `SIGNING_COMPLETED`)
  3. Check if all signers done → mark workflow `COMPLETED`
  4. Notify next signer (or workflow creator if complete)
- No document streaming from Drive
- No signature overlay on PDF (pdf-lib)

**Blocking dependencies:**
- `POST /api/workflows/{workflowId}/sign` with payload:
  ```typescript
  {
    signerId: string
    signatureBase64: string
    consentGiven: boolean
  }
  ```
- Prisma transaction logic per signing-flow.md
- Email notification service (Resend)
- PDF manipulation (pdf-lib) to embed signature image

**Files:**
- `app/sign/[workflowId]/page.tsx` — signing UI (DUMMY DATA)
- `components/signature-pad.tsx` — signature capture (working)

---

### CJ-626: My Signatures page wired to real data
**Status:** ✅ Done  
**What's working:**
- `app/signatures/page.tsx` fetches from `GET /api/signers/inbox`
- Displays pending and signed requests in separate tabs
- "Your Turn" badge highlighting
- "Sign Now" button for pending items where it's user's turn
- "View Workflow" button for other pending items
- "View Details" button for signed items
- Shows position in signing order (e.g., "Signer 2 of 3")
- Calculates `isYourTurn` based on sequential order

**What's missing:**
- Nothing — page fully functional

**Blocking dependencies:**
- None

**Files:**
- `app/signatures/page.tsx` — signer inbox (wired to real data)
- `app/api/signers/inbox/route.ts` — `GET /api/signers/inbox`

---

## Sprint 4 — Notifications, Settings & Compliance

### CJ-627: Email notifications
**Status:** 🔴 Not started  
**What's working:**
- Resend API key configured in `.env.local` (assumed)
- Email client library installed (`resend` package in `package.json`)

**What's missing:**
- **All email logic** — no email sending anywhere in codebase
- No email templates
- No `lib/email.ts` helper (mentioned in architecture.md but doesn't exist)
- No notification triggers:
  - Workflow created → notify first signer
  - Signer completes → notify next signer
  - Workflow completed → notify all signers + creator
  - Reminder sent → notify signer
- No rate limiting for reminders (schema has `lastReminderSentAt` but not enforced)

**Blocking dependencies:**
- Email template creation (HTML emails with branding)
- `lib/email.ts` helper using Resend SDK
- Integration in workflow creation and signing submission flows
- Reminder logic: max 1 per 24 hours per signer (per signing-flow.md)

**Files:**
- None — feature not started

---

### CJ-628: Settings & profile page
**Status:** 🔴 Not started  
**What's working:**
- Settings page UI exists at `app/settings/page.tsx`
- 5 tabs: Profile, Drive, Notifications, Security, Preferences
- Form inputs for all settings

**What's missing:**
- **All backend integration** — page uses hardcoded default values
- No `GET /api/user/profile` endpoint
- No `PATCH /api/user/profile` endpoint
- No `GET /api/user/drive-settings` endpoint (schema exists: `DriveSettings` table)
- No `PATCH /api/user/drive-settings` endpoint
- No notification preferences table (schema has `User.notificationPreferences` JSON field but not used)
- No password change logic
- No 2FA setup logic

**Blocking dependencies:**
- `GET /api/user/profile` → User table fields
- `PATCH /api/user/profile` → update name, company, title, locale, timezone
- `GET /api/user/drive-settings` → DriveSettings table
- `PATCH /api/user/drive-settings` → update saveLocation, targetFolderId, namingPattern, autoSave
- `PATCH /api/user/notification-preferences` → update `User.notificationPreferences` JSON
- Password change flow (Better Auth API)
- 2FA setup flow (Better Auth API)

**Files:**
- `app/settings/page.tsx` — settings UI (DUMMY DATA)

---

### CJ-629: Auto-save to Drive
**Status:** 🔴 Not started  
**What's working:**
- `DriveSettings` table exists in schema with fields:
  - `saveLocation` (SAME_FOLDER | SPECIFIC_FOLDER | ASK)
  - `targetFolderId`
  - `namingPattern` (default: `{name}_Signed_{date}`)
  - `autoSave` (boolean)

**What's missing:**
- **All save logic** — no code to save signed PDF back to Drive
- No PDF reconstruction after all signers complete
- No signature image overlay (pdf-lib)
- No Drive upload after signing complete
- No respect for user's `DriveSettings` preferences
- No filename generation using `namingPattern`

**Blocking dependencies:**
- PDF manipulation library (pdf-lib) to embed signatures
- Drive API upload endpoint wrapper
- Workflow completion trigger (when last signer signs)
- Store `signedFileId` in `Workflow` table after upload
- Error handling: what if Drive upload fails after signing is complete?

**Files:**
- None — feature not started

---

### CJ-630: Audit trail & compliance
**Status:** 🟡 Partial  
**What's working:**
- `AuditLog` table exists in schema with all required fields:
  - `workflowId`, `eventType`, `actorId`, `ipAddress`, `userAgent`, `timestamp`, `metadata`
- `AuditEventType` enum complete: WORKFLOW_CREATED, SIGNER_NOTIFIED, SIGNING_STARTED, etc.
- Schema enforces immutability (no `updatedAt` field)

**What's missing:**
- **No audit log writes anywhere in codebase** — table exists but nothing uses it
- No audit log API endpoint (`GET /api/workflows/{id}/audit-log`)
- No UI to view audit trail (workflow detail page shows mock audit events)
- No audit log helper function (mentioned in architecture.md as `lib/audit.ts` but doesn't exist)
- No IP address capture in API routes
- No user agent capture in API routes

**Blocking dependencies:**
- `lib/audit.ts` helper to standardize audit log writes
- Integration in all workflow mutation operations:
  - Workflow creation → `WORKFLOW_CREATED`
  - Signer notification → `SIGNER_NOTIFIED`
  - Document opened → `SIGNING_STARTED`
  - Signature submitted → `FIELD_SIGNED`, `SIGNING_COMPLETED`
  - Workflow completed → `WORKFLOW_COMPLETED`
  - Workflow cancelled → `WORKFLOW_CANCELLED`
  - Reminder sent → `REMINDER_SENT`
- `GET /api/workflows/{id}/audit-log` endpoint
- Audit log display in workflow detail page

**Files:**
- `prisma/schema.prisma` — AuditLog model exists
- No implementation files yet

---

## Pages Still Showing Dummy Data

### Critical Path (blocks signing flow)
1. **`app/sign/[workflowId]/page.tsx`** — Signing experience
   - Uses `mockWorkflow` and `currentUser` hardcoded objects
   - Needs: `GET /api/workflows/{id}`, `POST /api/workflows/{id}/sign`

2. **`app/workflows/new/page.tsx`** — Create workflow wizard
   - Uses `mockDriveFiles` and `mockTeamMembers` arrays
   - Needs: Integration with `/api/drive/files`, `GET /api/users`, `POST /api/workflows`

3. **`app/workflows/[id]/page.tsx`** — Workflow detail
   - Uses hardcoded `workflow` object with mock audit log
   - Needs: `GET /api/workflows/{id}`, `POST /api/workflows/{id}/remind`, `PATCH /api/workflows/{id}/cancel`

### Secondary Priority
4. **`app/settings/page.tsx`** — User settings
   - Uses hardcoded default values for all fields
   - Needs: `GET /api/user/profile`, `PATCH` endpoints for profile/drive/notifications

5. **`app/documents/**`** — All document pages
   - **Recommendation:** DELETE or REDIRECT to `/workflows/new`
   - Reason: Architecture is Drive-first (no in-app document creation)
   - Pages: `app/documents/page.tsx`, `app/documents/new/page.tsx`, `app/documents/[id]/page.tsx`

### Dev-Only (safe to delete)
6. **`app/test-drive/page.tsx`** — Testing page
   - **Recommendation:** DELETE before production
   - Used for testing Drive API integration (now complete)

---

## Database Schema Status

### Complete & Migrated
- ✅ `User` table (Better Auth integration)
- ✅ `Account` table (OAuth providers)
- ✅ `Session` table (session management)
- ✅ `Verification` table (email verification)
- ✅ `Workflow` table (includes `documentNumber`, `retentionDate`, `documentType` fields)
- ✅ `Signer` table (includes `consentGiven`, `consentTimestamp`, `lastReminderSentAt`)
- ✅ `SignatureField` table (ready for signature placement)
- ✅ `AuditLog` table (immutable, ready for compliance writes)
- ✅ `DriveSettings` table (user preferences for save location)

### Schema Notes
- `Workflow.documentNumber` exists but not auto-generated yet (needs sequence logic)
- `Workflow.retentionDate` exists but not enforced (needs cron job to delete expired workflows?)
- `User.notificationPreferences` is JSON type (flexible but not type-safe)
- All indexes present per db-schema.md skill

---

## API Endpoints Status

### Implemented & Working
- ✅ `GET /api/workflows` — list workflows for user
- ✅ `GET /api/workflows/stats` — dashboard stats
- ✅ `GET /api/signers/inbox` — signer's signature requests
- ✅ `GET /api/drive/files?folderId={id}` — list Drive files
- ✅ `GET /api/drive/search?q={query}` — search Drive files
- ✅ `GET /api/drive/connect` — Drive connection status
- ✅ `GET /api/health` — health check
- ✅ `POST /api/auth/**` — Better Auth routes

### Missing (Critical)
- 🔴 `POST /api/workflows` — create workflow
- 🔴 `GET /api/workflows/{id}` — workflow detail
- 🔴 `PATCH /api/workflows/{id}` — update workflow
- 🔴 `DELETE /api/workflows/{id}` — delete workflow (or cancel)
- 🔴 `POST /api/workflows/{id}/sign` — submit signature
- 🔴 `POST /api/workflows/{id}/remind` — send reminder
- 🔴 `GET /api/workflows/{id}/audit-log` — audit trail
- 🔴 `GET /api/users` — list authorized users
- 🔴 `GET /api/user/profile` — user profile
- 🔴 `PATCH /api/user/profile` — update profile
- 🔴 `GET /api/user/drive-settings` — Drive preferences
- 🔴 `PATCH /api/user/drive-settings` — update Drive preferences
- 🔴 `GET /api/drive/files/{fileId}` — get file metadata
- 🔴 `GET /api/drive/files/{fileId}/download` — download signed file

---

## Immediate Next Steps (Priority Order)

### 1. Complete Workflow Creation (CJ-621, CJ-622)
**Priority:** Critical — blocks all downstream work  
**Tasks:**
- [ ] Create `POST /api/workflows` endpoint
  - Accept: name, driveFileId, signers array, retentionDate, notification settings
  - Fetch file from Drive, compute SHA-256 hash
  - Insert Workflow row
  - Insert Signer rows (ordered)
  - Insert AuditLog entry (`WORKFLOW_CREATED`)
  - Return workflow ID
- [ ] Create `GET /api/users` endpoint (allowlisted users)
- [ ] Wire `app/workflows/new/page.tsx` to real APIs
  - Replace `mockDriveFiles` with `/api/drive/files`
  - Replace `mockTeamMembers` with `/api/users`
  - Submit to `POST /api/workflows` on step 4

### 2. Email Notifications (CJ-627)
**Priority:** Critical — required for workflow progression  
**Tasks:**
- [ ] Create `lib/email.ts` helper (Resend SDK)
- [ ] Design email templates (workflow created, your turn, reminder, completed)
- [ ] Send notification to first signer on workflow creation
- [ ] Send notification to next signer after signing complete

### 3. Signing Flow (CJ-624, CJ-625)
**Priority:** Critical — core feature  
**Tasks:**
- [ ] Create `GET /api/workflows/{id}` endpoint with signer verification
  - Check `session.user.email` matches a signer
  - Check previous signers have signed (sequential enforcement)
  - Return workflow + signers + document stream
- [ ] Create `POST /api/workflows/{id}/sign` endpoint
  - Accept: signerId, signatureBase64, consentGiven
  - Atomic transaction (per signing-flow.md):
    1. Update signer status → `SIGNED`
    2. Write audit logs
    3. Check if workflow complete
    4. Notify next signer or creator
- [ ] Wire `app/sign/[workflowId]/page.tsx` to real APIs
- [ ] Add signature image overlay to PDF (pdf-lib)
- [ ] Stream document from Drive for preview

### 4. Workflow Detail Page (CJ-620)
**Priority:** High — needed for monitoring workflows  
**Tasks:**
- [ ] Wire `app/workflows/[id]/page.tsx` to `GET /api/workflows/{id}`
- [ ] Create `POST /api/workflows/{id}/remind` endpoint
- [ ] Create `PATCH /api/workflows/{id}/cancel` endpoint
- [ ] Display real audit log from database

### 5. Auto-Save to Drive (CJ-629)
**Priority:** High — completes signing flow  
**Tasks:**
- [ ] Implement PDF reconstruction with signatures (pdf-lib)
- [ ] Respect user's `DriveSettings` for save location and naming
- [ ] Upload signed PDF to Drive after last signer completes
- [ ] Store `signedFileId` in Workflow table

### 6. Settings Page (CJ-628)
**Priority:** Medium  
**Tasks:**
- [ ] Create user profile endpoints (GET/PATCH)
- [ ] Create Drive settings endpoints (GET/PATCH)
- [ ] Wire `app/settings/page.tsx` to real APIs

### 7. Audit Trail UI (CJ-630)
**Priority:** Medium — compliance requirement  
**Tasks:**
- [ ] Create `lib/audit.ts` helper
- [ ] Add audit log writes to all workflow mutations
- [ ] Create `GET /api/workflows/{id}/audit-log` endpoint
- [ ] Display audit log in workflow detail page

### 8. Cleanup
**Priority:** Low  
**Tasks:**
- [ ] Delete `app/test-drive/page.tsx`
- [ ] Delete or redirect `app/documents/**` pages (conflicts with architecture)
- [ ] Decide: keep root `/` as dashboard or make separate landing page?

---

## Risk Assessment

### High Risk
- **No signing flow implemented** — core feature completely missing
- **No email notifications** — workflows can't progress without notifying signers
- **No workflow creation** — can't test end-to-end flow

### Medium Risk
- **No audit logging** — compliance requirement; data is being lost
- **No error handling for Drive API failures** — could leave workflows in inconsistent state
- **Document pages conflict with architecture** — needs architectural decision

### Low Risk
- **Settings page not wired** — non-blocking; users can still sign documents
- **Filter/sort dropdowns not functional** — UI exists, just not hooked up

---

## Testing Coverage

### Automated Tests
- **Unit tests:** None found (expected at `*.test.ts` files)
- **E2E tests:** Expected at `pnpm test:e2e` (Playwright) — not checked
- **Type checking:** ✅ Passing (`pnpm typecheck`)

### Manual Testing Needed
1. Full signing flow (end-to-end)
2. Email delivery (use Resend test mode)
3. Drive upload after workflow complete
4. Sequential signing enforcement
5. Identity verification (wrong user tries to sign)
6. Audit log completeness

---

**Last Updated:** 2026-04-16  
**Next Review:** After completing workflow creation API (CJ-621)
