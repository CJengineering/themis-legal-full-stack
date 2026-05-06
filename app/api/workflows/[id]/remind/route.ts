import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'
import { writeAuditLog } from '@/lib/audit'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/workflows/[id]/remind
 * Send a reminder email to the current pending signer.
 *
 * Rate limit: Max 1 reminder per signer per 24 hours.
 * Only the workflow creator can send reminders.
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
export async function POST(request: Request, context: RouteContext) {
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
          where: {
            status: { not: 'SIGNED' },
          },
          orderBy: {
            order: 'asc',
          },
          take: 1,
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // 4. Authorization: only workflow creator can send reminders
    if (workflow.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the workflow creator can send reminders' },
        { status: 403 }
      )
    }

    // 5. Check if workflow is in ACTIVE status
    if (workflow.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot send reminders for workflows that are not active' },
        { status: 400 }
      )
    }

    // 6. Get the current pending signer (lowest order unsigned)
    const currentSigner = workflow.signers[0]
    if (!currentSigner) {
      return NextResponse.json(
        { error: 'No pending signers found' },
        { status: 400 }
      )
    }

    // 7. Rate limit check: max 1 reminder per 24 hours
    if (currentSigner.lastReminderSentAt) {
      const hoursSinceLastReminder =
        (Date.now() - currentSigner.lastReminderSentAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastReminder < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastReminder)
        return NextResponse.json(
          {
            error: `Please wait ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} before sending another reminder`,
          },
          { status: 429 }
        )
      }
    }

    // 8. Calculate days waiting
    const createdAt = workflow.createdAt.getTime()
    const now = Date.now()
    const daysWaiting = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

    // 9. Send reminder email
    const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${workflowId}`
    const emailResult = await sendReminderEmail({
      to: currentSigner.email,
      signerName: currentSigner.name,
      workflowName: workflow.name,
      creatorName: workflow.creator.name,
      signUrl,
      daysWaiting,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send reminder: ${emailResult.error}` },
        { status: 500 }
      )
    }

    // 10. Update lastReminderSentAt
    await prisma.signer.update({
      where: { id: currentSigner.id },
      data: { lastReminderSentAt: new Date() },
    })

    // 11. Get IP and user agent for audit log
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    // 12. Write REMINDER_SENT audit log
    await writeAuditLog({
      workflowId,
      eventType: 'REMINDER_SENT',
      actorId: session.user.id,
      ipAddress,
      userAgent,
      metadata: {
        signerId: currentSigner.id,
        signerEmail: currentSigner.email,
        signerOrder: currentSigner.order,
        daysWaiting,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${currentSigner.name} (${currentSigner.email})`,
    })
  } catch (error) {
    console.error('Failed to send reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
