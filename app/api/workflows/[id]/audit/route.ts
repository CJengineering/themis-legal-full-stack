import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/workflows/[id]/audit
 * Returns the full audit trail for a specific workflow.
 *
 * Authorization:
 * - User must be the workflow creator OR a signer on the workflow
 *
 * Response:
 * {
 *   auditLog: Array<{
 *     id: string
 *     eventType: AuditEventType
 *     timestamp: DateTime
 *     ipAddress: string
 *     userAgent: string
 *     metadata: Json | null
 *     actor: { id: string, name: string, email: string }
 *   }>
 * }
 */
export async function GET(request: Request, context: RouteContext) {
  // 1. Authenticate user
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Get workflow ID from params
    const { id: workflowId } = await context.params

    // 3. Fetch workflow to verify authorization
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        creatorId: true,
        signers: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // 4. Authorization check: user must be creator OR signer
    const isCreator = workflow.creatorId === session.user.id
    const isSigner = workflow.signers.some(
      (s) => s.email.toLowerCase() === session.user.email.toLowerCase()
    )

    if (!isCreator && !isSigner) {
      return NextResponse.json(
        { error: 'You are not authorized to view this audit trail' },
        { status: 403 }
      )
    }

    // 5. Fetch audit log entries for this workflow
    const auditLog = await prisma.auditLog.findMany({
      where: {
        workflowId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ auditLog })
  } catch (error) {
    console.error('Error fetching audit trail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit trail' },
      { status: 500 }
    )
  }
}
