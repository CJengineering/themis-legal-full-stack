# Themis Legal — architecture overview

## Core principle
Themis is an **orchestrator**, not a storage layer.
Documents live in Google Drive. Themis stores only metadata, field positions,
signature images, and the audit trail.

## Request flow — creating a workflow
1. Creator authenticates (NextAuth)
2. Creator browses their Google Drive (Drive API, drive.file scope)
3. Creator selects a PDF/DOCX → Themis stores the Drive file ID + document hash
4. Creator adds signers (name + email + order)
5. Creator places signature fields (stored in SignatureField table)
6. Creator submits → Workflow status = ACTIVE → first signer notified via email

## Request flow — signing
1. Signer receives email with link → `/sign/[workflowId]`
2. Signer must authenticate (email must match signer record)
3. Document streamed from Drive → rendered in browser (never saved to disk)
4. Signer applies signatures to their fields
5. Signer checks consent checkbox → submits
6. Server: updates Signer status, writes audit_log, checks if workflow complete
7. If more signers: notify next signer
8. If complete: reconstruct signed PDF in memory → save back to Drive

## Key directories
```
src/
  app/
    (auth)/          ← login, register pages
    dashboard/       ← main dashboard (CJ-618)
    workflows/       ← workflow list + detail (CJ-619, CJ-620)
    workflows/new/   ← create workflow flow (CJ-621, CJ-622, CJ-623)
    sign/[id]/       ← signing experience (CJ-624, CJ-625)
    my-signatures/   ← signer's inbox (CJ-626)
    settings/        ← profile + preferences (CJ-628)
    api/
      auth/          ← NextAuth routes
      workflows/     ← CRUD + actions
      sign/          ← signing submission
      drive/         ← Drive proxy routes
      notifications/ ← email triggers
  lib/
    auth.ts          ← NextAuth config
    drive.ts         ← Drive client factory
    pdf.ts           ← PDF manipulation (pdf-lib)
    email.ts         ← Resend client
    audit.ts         ← audit log helper
  prisma/
    schema.prisma
```
