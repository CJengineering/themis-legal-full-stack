# Signing flow skill — load when working on workflow execution (CJ-623, CJ-624, CJ-625)

## Workflow states
```
DRAFT → ACTIVE → COMPLETED
              ↓
           CANCELLED
```
State transitions only happen server-side. Never trust a client-supplied state.

## Signer states
```
PENDING → NOTIFIED → SIGNING → SIGNED
```

## Advancing the workflow (critical path)
When a signer submits their signature, this MUST happen atomically in one DB transaction:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update signer record
  await tx.signer.update({
    where: { id: signerId },
    data: { status: 'SIGNED', signedAt: new Date() },
  })

  // 2. Write audit log
  await tx.auditLog.create({
    data: {
      workflowId,
      eventType: 'FIELD_SIGNED',
      actorId: session.user.id,
      ipAddress: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: { signerId, fieldIds },
    },
  })

  // 3. Check if all signers done
  const remaining = await tx.signer.count({
    where: { workflowId, status: { not: 'SIGNED' } },
  })

  if (remaining === 0) {
    await tx.workflow.update({
      where: { id: workflowId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
    await tx.auditLog.create({
      data: { workflowId, eventType: 'WORKFLOW_COMPLETED', actorId: session.user.id, ... }
    })
  } else {
    // 4. Notify next signer (do this OUTSIDE the transaction, after commit)
  }
})
// Send next-signer email after transaction commits
```

## Signature field types
- `SIGNATURE` — full drawn or typed signature
- `INITIALS` — abbreviated drawn or typed initials
- `DATE` — auto-filled with server-side UTC timestamp when signer submits

## Field data model
```typescript
{
  id: string
  workflowId: string
  assignedSignerId: string
  type: 'SIGNATURE' | 'INITIALS' | 'DATE'
  page: number
  x: number      // percentage of page width (0-100)
  y: number      // percentage of page height (0-100)
  width: number  // percentage of page width
  height: number // percentage of page height
  value?: string // base64 image for SIGNATURE/INITIALS, ISO string for DATE
}
```

## Sequential enforcement check
Before showing signing UI, always verify on the server:
```typescript
const myOrder = signer.order
if (myOrder > 0) {
  const prevSigner = await prisma.signer.findFirst({
    where: { workflowId, order: myOrder - 1 }
  })
  if (prevSigner?.status !== 'SIGNED') {
    return { error: 'Previous signer has not signed yet' }
  }
}
```

## Reminder rate limiting (CJ-620)
Max 1 reminder per signer per 24 hours. Store `lastReminderSentAt` on Signer.
