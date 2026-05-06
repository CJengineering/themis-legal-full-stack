# UI Audit — Themis Legal

**Date:** 2026-04-16  
**Purpose:** Map all hardcoded/dummy data to real database queries and API endpoints  
**Scope:** All routes in /app and shared components with dummy data

---

## / (Root/Landing Page)
- **File:** `app/page.tsx`
- **Status:** ⚠️ Duplicate — Identical to dashboard page
- **Dummy data:**
  ```typescript
  const workflows: Workflow[] = [
    { id: "wf-001", title: "Mutual Non-Disclosure Agreement...", ... },
    { id: "wf-002", title: "Professional Services Agreement...", ... },
    // 5 workflows total with hardcoded signers, progress, status
  ]
  ```
- **Real data needed:**
  - `GET /api/workflows?userId={currentUser}` → list of workflows where user is creator OR signer
  - Each workflow: id, title, driveFileId, drivePath, status, currentStep, totalSteps, createdBy, createdAt, updatedAt
  - Signers array for each workflow from DB
- **Props/components with dummy data:**
  - `<StatsCards />` — see separate component section
  - `<WorkflowCard workflow={...} />` — receives workflow object
- **Status:** ⚠️ Needs decision — Should root redirect to /dashboard or show landing page?

---

## /dashboard (Authenticated Dashboard)
- **File:** `app/dashboard/page.tsx`
- **Status:** ✅ Auth implemented, needs data wiring
- **Dummy data:** None — uses session for user info only
- **Real data needed:**
  - Session user info already wired: `session.user.id`, `session.user.email`, `session.user.name`, `session.user.image`
- **Props/components with dummy data:** None
- **Status:** ✅ Ready to wire — This is the minimal authenticated dashboard

---

## /documents (Documents List)
- **File:** `app/documents/page.tsx`
- **Status:** 🔴 Needs API first
- **Dummy data:**
  ```typescript
  const documents: Array<{
    id: string, title: string, type: "contract" | "nda" | "authorization",
    status: DocumentStatus, signers: { total: number; signed: number },
    updatedAt: string, createdBy: string
  }> = [
    { id: "1", title: "Software Development Agreement - TechCorp Inc.", ... },
    // 8 documents total
  ]
  ```
- **Real data needed:**
  - `GET /api/documents?userId={currentUser}` OR use Workflow table
  - Filter/sort params: `?type=contract`, `?status=pending`, `?sort=recent`
  - Tab counts: drafts, pending, completed
- **Props/components with dummy data:**
  - `<DocumentCard {...doc} />` — see component section
- **Status:** 🔴 Needs schema change — Document type not in Workflow schema. Either:
  1. Add `documentType` enum to Workflow, OR
  2. Infer from driveFileId metadata

---

## /documents/new (Create Document)
- **File:** `app/documents/new/page.tsx`
- **Status:** 🔴 Not compatible with architecture
- **Dummy data:**
  ```typescript
  // Block-based document editor with 3 templates:
  const ndaBlocks: Block[] = [/* 80 lines of NDA text */]
  const contractBlocks: Block[] = [/* 110 lines of contract text */]
  const authorizationBlocks: Block[] = [/* 128 lines of auth text */]
  
  const [blocks, setBlocks] = useState<Block[]>(ndaBlocks)
  const [signers, setSigners] = useState<Signer[]>([])
  const [creatorIsSigner, setCreatorIsSigner] = useState(true)
  ```
- **Real data needed:** N/A — This page contradicts architecture
- **Props/components with dummy data:**
  - `<BlockEditor blocks={...} />` — rich text editor
  - `<SignerManagement signers={...} />` — signer list
  - `<SignatureFieldDialog />` — signature placement
- **Status:** ⚠️ DELETE OR REDIRECT — Per CLAUDE.md, documents come from Drive. This page assumes in-app document creation. Either:
  1. Delete this page, OR
  2. Redirect to `/workflows/new` (select from Drive)

---

## /documents/[id] (Document Detail)
- **File:** `app/documents/[id]/page.tsx`
- **Status:** 🔴 Needs API + Decision
- **Dummy data:**
  ```typescript
  const mockDocument = {
    id: "3", title: "Employment Contract - Sarah Johnson",
    type: "Contract", status: "completed", documentNumber: "EC-2026-04-0147",
    createdAt: "April 1, 2026", completedAt: "April 5, 2026 at 4:15 PM",
    effectiveDate: "April 15, 2026",
    createdBy: { name: "John Doe", email: "john@lawfirm.com", ... },
    company: { name: "Morrison & Associates LLP", ... },
    signers: [/* 2 signers with full details */],
    auditTrail: [/* 8 audit events */]
  }
  // Plus 485 lines of inline HTML for rendered legal document
  ```
- **Real data needed:**
  - `GET /api/workflows/{id}` with full signer + audit log joins
  - `GET /api/drive/files/{driveFileId}` to render actual document
  - `documentNumber`, `effectiveDate`, `company` fields NOT in schema
- **Props/components with dummy data:** None (all inline)
- **Status:** 🔴 Needs schema change — Workflow table missing:
  - `documentNumber` (auto-generated?)
  - `effectiveDate` (Date?)
  - Company info (new Company table or just store on User?)
  - This page shows a **fully rendered PDF-like document** — need PDF rendering strategy

---

## /drive (Google Drive Browser)
- **File:** `app/drive/page.tsx`
- **Status:** 🟡 Needs API wiring
- **Dummy data:**
  ```typescript
  const driveContents: DriveItem[] = [
    { id: "1", name: "Legal", type: "folder", modifiedAt: "April 5, 2026" },
    { id: "2", name: "HR", type: "folder", modifiedAt: "April 3, 2026" },
    { id: "5", name: "Company Policy Updates 2026.pdf", type: "file", ... },
    // 6 items total
  ]
  const breadcrumb = [{ name: "My Drive", path: "/drive" }]
  ```
- **Real data needed:**
  - `GET /api/drive/files?folderId={id}` — list folder contents
  - `GET /api/drive/files` — list root
  - Search: `GET /api/drive/search?q={query}`
  - See @.claude/skills/google-drive.md for Drive API patterns
- **Props/components with dummy data:** None (inline `DriveItemRow`)
- **Status:** 🟡 Needs API first — Backend endpoints exist per test-drive page

---

## /settings (User Settings)
- **File:** `app/settings/page.tsx`
- **Status:** 🟡 Needs API wiring
- **Dummy data:**
  ```typescript
  // Profile tab
  defaultValue="John" / "Doe" / "john@lawfirm.com" / "Mitchell & Associates LLP" / "Senior Partner"
  
  // Drive tab
  const [isDriveConnected, setIsDriveConnected] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  // Hardcoded "john@lawfirm.com" as connected account
  
  // Notifications tab
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [signatureReminders, setSignatureReminders] = useState(true)
  const [completionNotifications, setCompletionNotifications] = useState(true)
  const [workflowUpdates, setWorkflowUpdates] = useState(true)
  
  // Security tab: no dummy data (just form inputs)
  // Preferences tab: dropdown defaults
  ```
- **Real data needed:**
  - `GET /api/user/profile` → User table: name, email, company, title
  - `GET /api/user/drive-settings` → DriveSettings table
  - `GET /api/user/notification-preferences` → need new table or JSON field on User
  - `PATCH /api/user/profile`, `PATCH /api/user/drive-settings`, etc.
- **Props/components with dummy data:** None
- **Status:** 🟡 Needs API first — DriveSettings table exists in schema; notification preferences need schema addition

---

## /sign/[workflowId] (Signing Experience)
- **File:** `app/sign/[workflowId]/page.tsx`
- **Status:** 🔴 Critical path — Needs API first
- **Dummy data:**
  ```typescript
  const currentUser = { id: "u1", name: "John Doe", email: "john@lawfirm.com" }
  
  const mockWorkflow = {
    id: "wf-001", title: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
    drivePath: "Legal/NDAs/Tech Ventures", driveFileId: "1abc123",
    driveUrl: "https://drive.google.com/file/d/1abc123",
    createdBy: { name: "James Mitchell", email: "james@lawfirm.com" },
    signers: [
      { id: "s1", name: "James Mitchell", ..., status: "signed", signedAt: "...", order: 1 },
      { id: "s2", name: "John Doe", ..., status: "current", order: 2 },
      { id: "s3", name: "Sarah Chen", ..., status: "pending", order: 3 }
    ]
  }
  
  const documentContent = `<div class="legal-document">...</div>` // 132 lines of NDA HTML
  ```
- **Real data needed:**
  - `GET /api/workflows/{id}` with signers, check if `currentUser.email` matches a signer
  - Enforce sequential order: verify previous signer signed before showing UI
  - `GET /api/drive/files/{driveFileId}/content` to stream document
  - `POST /api/workflows/{id}/sign` with signature data (see signing-flow.md)
  - Write to audit_log on every action
- **Props/components with dummy data:**
  - `<SignaturePad onSignatureChange={...} signerName={...} />` — captures signature
- **Status:** 🔴 Needs API first — Core signing flow per CJ-624, CJ-625

---

## /signatures (Signer Inbox)
- **File:** `app/signatures/page.tsx`
- **Status:** 🟡 Needs API wiring
- **Dummy data:**
  ```typescript
  const signatureRequests: SignatureRequest[] = [
    {
      id: "sr-001", workflowId: "wf-001",
      documentTitle: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
      drivePath: "Legal/NDAs/Tech Ventures", requestedBy: "James Mitchell",
      requestedAt: "April 5, 2026", status: "pending",
      yourPosition: 2, totalSigners: 3, isYourTurn: true
    },
    // 4 signature requests total
  ]
  ```
- **Real data needed:**
  - `GET /api/signers?email={currentUser.email}` → all Signer records for this user
  - Join to Workflow to get document title, drivePath, creator
  - Calculate `isYourTurn` by checking signer order and prior signers' status
- **Props/components with dummy data:** Inline `SignatureRequestCard`
- **Status:** 🟡 Needs API first — CJ-626 "My Signatures" page

---

## /templates (Template Library)
- **File:** `app/templates/page.tsx`
- **Status:** ⚠️ Not in MVP scope
- **Dummy data:**
  ```typescript
  const templates = [
    { id: "1", name: "Standard Contract", description: "...", type: "contract", icon: FileText, usageCount: 12 },
    // 6 templates total
  ]
  ```
- **Real data needed:** `GET /api/templates` if we build templates feature
- **Props/components with dummy data:** None
- **Status:** ⚠️ DEFER — Templates not mentioned in CLAUDE.md or skills. Consider removing or hiding until post-MVP

---

## /workflows (Workflow List)
- **File:** `app/workflows/page.tsx`
- **Status:** 🟡 Needs API wiring (DUPLICATE of / page)
- **Dummy data:** Same 5 workflows as root page (`wf-001` through `wf-005`)
- **Real data needed:** Same as root page — `GET /api/workflows?userId={currentUser}`
- **Props/components with dummy data:** `<WorkflowCard workflow={...} />`
- **Status:** 🟡 Needs API first — Identical to root, decide which is canonical

---

## /workflows/[id] (Workflow Detail)
- **File:** `app/workflows/[id]/page.tsx`
- **Status:** 🟡 Needs API wiring
- **Dummy data:**
  ```typescript
  const workflow = {
    id: "wf-001", title: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
    driveFileId: "1abc123", drivePath: "Legal/NDAs/Tech Ventures",
    driveUrl: "https://drive.google.com/file/d/1abc123",
    status: "in_progress", currentStep: 2, totalSteps: 3,
    createdBy: "James Mitchell", createdAt: "April 5, 2026 at 9:30 AM",
    updatedAt: "April 8, 2026 at 2:15 PM", retentionDate: "April 5, 2029",
    signers: [/* 3 signers with order, status, signedAt */],
    auditLog: [/* 6 audit events */]
  }
  const isUserTurn = workflow.signers.find(s => s.current)?.email === "john@lawfirm.com"
  ```
- **Real data needed:**
  - `GET /api/workflows/{id}` with full joins: Workflow + Signers + AuditLog
  - Filter audit log by workflowId, order by timestamp DESC
  - `retentionDate` field missing from schema
- **Props/components with dummy data:** None
- **Status:** 🟡 Needs schema change — Add `retentionDate` to Workflow table

---

## /workflows/new (Create Workflow — 4-step wizard)
- **File:** `app/workflows/new/page.tsx`
- **Status:** 🔴 Critical path — Needs API first
- **Dummy data:**
  ```typescript
  // Step 1: Select Document
  const mockDriveFiles: DriveFile[] = [
    { id: "f1", name: "Legal", type: "folder", path: "/Legal", ... },
    { id: "d1", name: "NDA_Template_2026.docx", type: "file", ... },
    // 6 items total
  ]
  
  // Step 2: Add Signers
  const mockTeamMembers = [
    { id: "u1", name: "John Doe", email: "john@lawfirm.com", role: "Partner" },
    // 5 team members total
  ]
  
  // Step 3 & 4: Form state only (no dummy data)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [retentionDate, setRetentionDate] = useState<Date | undefined>()
  ```
- **Real data needed:**
  - **Step 1:** `GET /api/drive/files` → Browse Drive (see /drive page)
  - **Step 2:** `GET /api/users` → List authorized users (allowlist)
  - **Step 3:** Config settings (store as JSON on Workflow?)
  - **Step 4:** `POST /api/workflows` with:
    - driveFileId, signers array (ordered), notifyOnSign, notifyOnComplete, retentionDate
    - Compute documentHash from Drive file
    - Create Signer records
    - Create WORKFLOW_CREATED audit log entry
    - Notify first signer
- **Props/components with dummy data:** None (all inline)
- **Status:** 🔴 Needs API first — CJ-621, CJ-622, CJ-623 (Select Doc, Configure Signers, Set Options)

---

## /(auth)/login (Google OAuth Login)
- **File:** `app/(auth)/login/page.tsx`
- **Status:** ✅ Already implemented via Better Auth
- **Dummy data:** None
- **Real data needed:** Better Auth handles OAuth flow; AUTHORIZED_EMAILS env var filters allowlist
- **Props/components with dummy data:** None
- **Status:** ✅ Ready to wire — Login works per lib/auth.ts

---

## /test-drive (Dev Testing Page)
- **File:** `app/test-drive/page.tsx`
- **Status:** ✅ Dev-only — DELETE BEFORE PRODUCTION
- **Dummy data:** None (calls real API endpoints)
- **Real data needed:** N/A
- **Props/components with dummy data:**
  - `<FilePicker />` from `components/drive/FilePicker.tsx`
- **Status:** ⚠️ DELETE WHEN DONE — Per instructions, remove after CJ-617 is complete

---

# Shared Components with Dummy Data

## `<StatsCards />` (components/stats-cards.tsx)
- **Used in:** `/` (root), possibly dashboard
- **Dummy data:**
  ```typescript
  const stats = [
    { label: "Active Workflows", value: "5", icon: GitBranch, ... },
    { label: "Awaiting Signatures", value: "8", icon: Clock, ... },
    { label: "Completed", value: "12", icon: CheckCircle2, ... },
    { label: "Your Turn to Sign", value: "2", icon: PenTool, ... }
  ]
  ```
- **Real data needed:**
  - `GET /api/workflows/stats?userId={currentUser}` → aggregate counts:
    - Active: `WHERE status = 'ACTIVE'`
    - Awaiting: `WHERE status = 'ACTIVE' AND signers have pending status`
    - Completed: `WHERE status = 'COMPLETED' AND completedAt > startOfMonth`
    - Your Turn: `WHERE signers.email = {user} AND signers.status = 'current'`
- **Status:** 🟡 Needs API first

---

## `<DocumentCard />` (components/document-card.tsx)
- **Used in:** `/documents` page
- **Props:**
  ```typescript
  id: string
  title: string
  type: "contract" | "nda" | "authorization"
  status: DocumentStatus // "draft" | "pending" | "completed" | "waiting"
  signers: { total: number; signed: number }
  updatedAt: string
  createdBy: string
  ```
- **Real data needed:** Passed down from parent; no internal dummy data
- **Status:** ✅ Ready to wire — Just needs parent to pass real props

---

## `<SignerManagement />` (components/signer-management.tsx)
- **Used in:** `/documents/new` (which may be deleted)
- **Props:** Controlled component, receives signers array from parent
- **Dummy data:** Hardcoded creator in parent:
  ```typescript
  creatorEmail="john@lawfirm.com"
  creatorName="John Doe"
  ```
- **Real data needed:** Creator info from session
- **Status:** ⚠️ Needs decision — If /documents/new is deleted, this component may not be needed

---

## `<SignaturePad />` (components/signature-pad.tsx)
- **Used in:** `/sign/[workflowId]` signing dialog
- **Props:** `onSignatureChange`, `signerName`
- **Dummy data:** None (pure UI component)
- **Status:** ✅ Ready to wire — Works as-is

---

## `<BlockEditor />` (components/block-editor.tsx)
- **Used in:** `/documents/new` (which may be deleted)
- **Props:** Receives blocks array from parent
- **Dummy data:** None (controlled component)
- **Status:** ⚠️ Needs decision — If /documents/new is deleted, this is unused

---

# Summary Table

| Route | Status | Blocker | Sprint Priority |
|-------|--------|---------|-----------------|
| `/` (root) | ⚠️ Duplicate | Decide: redirect to /dashboard or keep as separate? | Low |
| `/dashboard` | ✅ Ready | None | ✅ Done |
| `/documents` | 🔴 Blocked | Needs API + schema (document type) | Sprint 2+ |
| `/documents/new` | ⚠️ Delete? | Contradicts architecture (Drive-first) | N/A |
| `/documents/[id]` | 🔴 Blocked | Needs API + schema + PDF rendering | Sprint 2+ |
| `/drive` | 🟡 API needed | Backend exists, wire up | Sprint 1 (CJ-617) |
| `/settings` | 🟡 API needed | DriveSettings exists; add notification prefs | Sprint 2 |
| `/sign/[workflowId]` | 🔴 Critical | Needs full signing flow API | **Sprint 1 (CJ-624, CJ-625)** |
| `/signatures` | 🟡 API needed | Signer inbox | **Sprint 1 (CJ-626)** |
| `/templates` | ⚠️ Defer | Not in MVP scope | Post-MVP |
| `/workflows` | 🟡 API needed | Duplicate of root | Sprint 1 (CJ-619) |
| `/workflows/[id]` | 🟡 API needed | Workflow detail | Sprint 1 (CJ-620) |
| `/workflows/new` | 🔴 Critical | 4-step wizard, create workflow | **Sprint 1 (CJ-621-623)** |
| `/(auth)/login` | ✅ Ready | None | ✅ Done |
| `/test-drive` | ⚠️ Delete | Remove before production | N/A |

---

# Action Items

## Immediate (Sprint 1)
1. **DELETE** `/test-drive` when Drive integration is confirmed working (CJ-617)
2. **DECIDE** on `/documents/new`:
   - If keeping: add API to create documents from scratch (conflicts with Drive-first)
   - If removing: redirect to `/workflows/new`
3. **DECIDE** on root `/` vs `/dashboard`:
   - Option A: Root redirects to /dashboard
   - Option B: Root is public landing, /dashboard is authenticated
4. **BUILD** core signing flow APIs (CJ-624, CJ-625):
   - `GET /api/workflows/{id}` with auth check
   - `POST /api/workflows/{id}/sign` with signature data
   - Atomic transaction per signing-flow.md
5. **BUILD** signer inbox API (CJ-626):
   - `GET /api/signers?email={user}`

## Sprint 2+
6. **ADD** schema fields:
   - `Workflow.retentionDate` (Date?)
   - `Workflow.documentType` (enum?) OR infer from Drive
   - `Workflow.documentNumber` (auto-generated string?)
   - `User.notificationPreferences` (JSON?) OR new table
7. **BUILD** document detail page with PDF rendering
8. **BUILD** stats aggregation endpoint
9. **DEFER** templates feature until post-MVP

---

**End of audit — Ready for wiring sprints**
