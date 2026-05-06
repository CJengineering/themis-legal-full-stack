import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/workflows/[id]
 * Fetches workflow data for detail page or signing.
 *
 * Authorization:
 * - User must be workflow creator OR a signer on the workflow
 * - Signers: also enforces sequential order check (for signing flow)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // 2. Fetch workflow with all relationships
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        signers: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            email: true,
            order: true,
            status: true,
            signedAt: true,
            consentGiven: true,
            lastReminderSentAt: true,
          },
        },
        fields: {
          select: {
            id: true,
            signerId: true,
            type: true,
            value: true,
            completedAt: true,
          },
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          select: {
            id: true,
            eventType: true,
            timestamp: true,
            metadata: true,
            actor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // 3. Determine user's role: creator, signer, or both
    const isCreator = workflow.creatorId === session.user.id
    const signerRecord = workflow.signers.find(
      (s) => s.email.toLowerCase() === session.user.email.toLowerCase()
    )
    const isSigner = !!signerRecord

    // Authorization: must be creator OR signer
    if (!isCreator && !isSigner) {
      return NextResponse.json(
        { error: 'You are not authorized to view this workflow' },
        { status: 403 }
      )
    }

    const myRole = isCreator && isSigner ? 'both' : isCreator ? 'creator' : 'signer'

    // 4. If user is a signer, perform sequential order check
    let isYourTurn = false
    if (isSigner && signerRecord) {
      const previousSigners = workflow.signers.filter(
        (s) => s.order < signerRecord.order
      )
      const unsignedPrevious = previousSigners.find((s) => s.status !== 'SIGNED')

      // It's your turn if all previous signers have signed AND you haven't signed yet
      isYourTurn = !unsignedPrevious && signerRecord.status !== 'SIGNED'

      // 5. Write SIGNING_STARTED audit log (only if accessing for signing)
      if (isYourTurn) {
        const hasStartedBefore = await prisma.auditLog.findFirst({
          where: {
            workflowId: id,
            eventType: 'SIGNING_STARTED',
            actorId: session.user.id,
          },
        })

        if (!hasStartedBefore) {
          const headersList = await headers()
          const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
          const userAgent = headersList.get('user-agent') ?? 'unknown'

          await writeAuditLog({
            workflowId: id,
            eventType: 'SIGNING_STARTED',
            actorId: session.user.id,
            ipAddress,
            userAgent,
            metadata: {
              signerId: signerRecord.id,
              signerOrder: signerRecord.order,
            },
          })
        }
      }
    }

    // 6. Calculate current signer (lowest order unsigned)
    const currentSigner = workflow.signers.find((s) => s.status !== 'SIGNED') ?? null

    // 7. Return full workflow data
    return NextResponse.json({
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        driveFileId: workflow.driveFileId,
        driveFolderId: workflow.driveFolderId,
        documentHash: workflow.documentHash,
        documentNumber: workflow.documentNumber,
        documentType: workflow.documentType,
        retentionDate: workflow.retentionDate,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        completedAt: workflow.completedAt,
        cancelledAt: workflow.cancelledAt,
        creator: workflow.creator,
        signers: workflow.signers,
        fields: workflow.fields,
      },
      auditLog: workflow.auditLogs.map((log) => ({
        id: log.id,
        eventType: log.eventType,
        timestamp: log.timestamp,
        metadata: log.metadata,
        actor: log.actor,
      })),
      currentSigner,
      myRole,
      isYourTurn,
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workflows/[id]
 * Permanently deletes a workflow and all related records.
 *
 * Authorization:
 * - User must be the workflow creator
 * - Returns 403 if user is not the creator
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: workflowId } = await params

  try {
    // 2. Fetch workflow to check authorization
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        creatorId: true,
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // 3. Authorization check - must be creator
    if (workflow.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the workflow creator can delete this workflow' },
        { status: 403 }
      )
    }

    // 4. Get IP and user agent for audit
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    // 5. Delete workflow in transaction
    await prisma.$transaction(async (tx) => {
      // Write audit log BEFORE deleting workflow (FK constraint requirement)
      await tx.auditLog.create({
        data: {
          workflowId,
          eventType: 'WORKFLOW_DELETED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            workflowName: workflow.name,
          },
        },
      })

      // Delete workflow (cascade auto-deletes Signer, SignatureField, AuditLog)
      await tx.workflow.delete({
        where: { id: workflowId },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}
