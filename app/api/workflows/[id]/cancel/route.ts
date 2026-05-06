import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { sendWorkflowCancelled } from '@/lib/email'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/workflows/[id]/cancel
 * Cancel an active workflow.
 *
 * Authorization: Only the workflow creator can cancel.
 * Constraint: Workflow must be ACTIVE status.
 *
 * Actions:
 * 1. Update workflow status to CANCELLED
 * 2. Write WORKFLOW_CANCELLED audit log
 * 3. Send cancellation emails to all non-SIGNED signers
 */
// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, context: RouteContext) {
  // 1. Authenticate user
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Get workflow ID from params
    const { id: workflowId } = await context.params

    // 3. Fetch workflow and verify creator
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signers: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // 4. Authorization: only workflow creator can cancel
    if (workflow.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the workflow creator can cancel this workflow' },
        { status: 403 }
      )
    }

    // 5. Verify workflow is ACTIVE
    if (workflow.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: `Cannot cancel workflow with status ${workflow.status}`,
          message: 'Only active workflows can be cancelled',
        },
        { status: 400 }
      )
    }

    // 6. Get IP and user agent for audit log
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    // 7. Transaction: update workflow and write audit log
    await prisma.$transaction(async (tx) => {
      // Update workflow status
      await tx.workflow.update({
        where: { id: workflowId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      // Write WORKFLOW_CANCELLED audit log
      await tx.auditLog.create({
        data: {
          workflowId,
          eventType: 'WORKFLOW_CANCELLED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            cancelledBy: session.user.email,
            cancelledByName: session.user.name,
          },
        },
      })
    })

    // 8. After transaction: send cancellation emails to non-SIGNED signers
    const nonSignedSigners = workflow.signers.filter((s) => s.status !== 'SIGNED')

    await Promise.allSettled(
      nonSignedSigners.map((signer) =>
        sendWorkflowCancelled({
          to: signer.email,
          workflowName: workflow.name,
          cancelledBy: workflow.creator.name,
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Workflow cancelled successfully',
    })
  } catch (error) {
    console.error('Failed to cancel workflow:', error)
    return NextResponse.json(
      { error: 'Failed to cancel workflow' },
      { status: 500 }
    )
  }
}
