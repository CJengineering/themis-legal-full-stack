# Legal compliance & audit trail — load for any signing, auth, or compliance work (CJ-630)

## The audit_log table — EVERY signing event needs a row
```typescript
// eventType enum:
type AuditEventType =
  | 'WORKFLOW_CREATED'
  | 'SIGNER_NOTIFIED'
  | 'SIGNING_STARTED'      // signer opened the document
  | 'FIELD_SIGNED'         // signer applied signature to a field
  | 'SIGNING_COMPLETED'    // signer submitted all fields
  | 'WORKFLOW_COMPLETED'   // all signers done
  | 'WORKFLOW_CANCELLED'
  | 'REMINDER_SENT'
  | 'AUTH_SUCCESS'         // signer authenticated
  | 'AUTH_FAILURE'         // failed auth attempt

// Required fields on every row:
{
  workflowId: string
  eventType: AuditEventType
  actorId: string          // authenticated user ID (or 'system' for automated events)
  ipAddress: string        // from x-forwarded-for or socket
  userAgent: string        // from request headers
  timestamp: DateTime      // server UTC — NEVER trust client timestamps
  metadata?: Json          // event-specific extras (fieldIds, signerId, etc.)
}
```
Audit rows are IMMUTABLE. Never update or delete them. No soft-deletes.

## E-signature legal requirements (ESIGN Act / eIDAS)
Before any signature is recorded, ALL of these must be true:
- [ ] Signer is authenticated (session exists, email matches workflow)
- [ ] Signer has checked the consent checkbox (validate server-side)
- [ ] Consent timestamp is stored in the `Signer` record
- [ ] Document has not been modified since workflow was created (check hash)
- [ ] `AUTH_SUCCESS` audit event exists for this signer on this workflow

## Document integrity
On workflow creation, compute and store SHA-256 hash of the document:
```typescript
import { createHash } from 'crypto'
const hash = createHash('sha256').update(fileBuffer).digest('hex')
await prisma.workflow.update({ where: { id }, data: { documentHash: hash } })
```
Before showing document to each signer, recompute hash and compare.
If hashes differ → abort with error, log `DOCUMENT_INTEGRITY_FAILURE` to audit_log.

## What "no file storage" means in practice
- Fetch document from Drive for preview → stream to client, never write to disk
- Fetch document for signing → stream, never buffer full file in memory
- After all signatures collected → reconstruct PDF in memory → stream back to Drive
- Our DB stores: field positions + signature images (base64) + metadata
- Our DB does NOT store: the original document bytes, any Drive file content

## Consent UI requirements (CJ-625)
The consent checkbox text must include:
- Statement that electronic signature is legally binding
- Reference to ESIGN Act or local equivalent
- Agreement to receive documents electronically
Submit button must be disabled until checkbox is checked.
Validate server-side — do not trust client-side checkbox state.
