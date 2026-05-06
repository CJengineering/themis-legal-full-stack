import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNextSignerOrComplete } from '@/lib/email'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * POST /api/workflows/[id]/sign
 * Submits a signature for the current user on a workflow.
 *
 * Request body:
 * - signatureBase64: string (base64-encoded signature image or typed signature)
 * - consentGiven: boolean (must be true)
 *
 * Authorization checks:
 * 1. User must be authenticated
 * 2. User's email must match a signer on the workflow
 * 3. User must not have already signed
 * 4. All previous signers must have status SIGNED
 * 5. Consent must be given
 */
// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function POST(
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
    // 2. Parse and validate body
    const body = await request.json()
    const { signatureBase64, consentGiven } = body

    if (!signatureBase64 || typeof signatureBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      )
    }

    if (consentGiven !== true) {
      return NextResponse.json(
        { error: 'Consent must be given to sign' },
        { status: 400 }
      )
    }

    // 3. Find signer record
    const signer = await prisma.signer.findFirst({
      where: {
        workflowId,
        email: session.user.email.toLowerCase(),
      },
      include: {
        workflow: {
          include: {
            signers: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!signer) {
      return NextResponse.json(
        { error: 'You are not authorized to sign this workflow' },
        { status: 403 }
      )
    }

    // 4. Check if workflow is cancelled
    if (signer.workflow.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This workflow has been cancelled' },
        { status: 400 }
      )
    }

    // 5. Check if already signed
    if (signer.status === 'SIGNED') {
      return NextResponse.json(
        { error: 'You have already signed this workflow' },
        { status: 400 }
      )
    }

    // 6. Sequential check: verify previous signers signed
    const previousSigners = signer.workflow.signers.filter(
      (s) => s.order < signer.order
    )

    const unsignedPrevious = previousSigners.find((s) => s.status !== 'SIGNED')
    if (unsignedPrevious) {
      return NextResponse.json(
        { error: `Not your turn yet. Waiting for ${unsignedPrevious.name}` },
        { status: 403 }
      )
    }

    // 7. Get IP and user agent for audit
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    // 8. Atomic transaction: update signer, update signature fields, write audit logs
    await prisma.$transaction(async (tx) => {
      // a. Update signer
      await tx.signer.update({
        where: { id: signer.id },
        data: {
          status: 'SIGNED',
          signedAt: new Date(),
          consentGiven: true,
          consentTimestamp: new Date(),
        },
      })

      // b. Update existing signature fields with signature value
      // Fields were already placed during CJ-623, now we fill in the signature image
      // Handle each field type separately
      const signatureFieldsUpdated = await tx.signatureField.updateMany({
        where: {
          workflowId,
          signerId: signer.id,
          type: 'SIGNATURE',
        },
        data: {
          value: signatureBase64,
          completedAt: new Date(),
        },
      })

      const initialsFieldsUpdated = await tx.signatureField.updateMany({
        where: {
          workflowId,
          signerId: signer.id,
          type: 'INITIALS',
        },
        data: {
          value: signatureBase64,
          completedAt: new Date(),
        },
      })

      const dateFieldsUpdated = await tx.signatureField.updateMany({
        where: {
          workflowId,
          signerId: signer.id,
          type: 'DATE',
        },
        data: {
          value: new Date().toISOString(),
          completedAt: new Date(),
        },
      })

      const updatedFields = {
        count: signatureFieldsUpdated.count + initialsFieldsUpdated.count + dateFieldsUpdated.count,
      }

      // c. Write FIELD_SIGNED audit log
      await tx.auditLog.create({
        data: {
          workflowId,
          eventType: 'FIELD_SIGNED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            signerId: signer.id,
            signerOrder: signer.order,
            fieldsUpdated: updatedFields.count,
          },
        },
      })

      // d. Write SIGNING_COMPLETED audit log
      await tx.auditLog.create({
        data: {
          workflowId,
          eventType: 'SIGNING_COMPLETED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            signerId: signer.id,
            signerOrder: signer.order,
          },
        },
      })
    })

    // 9. After transaction: notify next signer or complete workflow
    const notificationResult = await notifyNextSignerOrComplete({
      workflowId,
      completedSignerId: signer.id,
      ipAddress,
      userAgent,
    })

    if (!notificationResult.success) {
      console.error('Failed to notify next signer:', notificationResult.error)
      // Don't fail the request - signature is already recorded
    }

    // 10. Check if workflow is complete
    const remainingSigners = await prisma.signer.count({
      where: {
        workflowId,
        status: { not: 'SIGNED' },
      },
    })

    const workflowComplete = remainingSigners === 0

    return NextResponse.json({
      success: true,
      workflowComplete,
    })
  } catch (error) {
    console.error('Error submitting signature:', error)
    return NextResponse.json(
      { error: 'Failed to submit signature' },
      { status: 500 }
    )
  }
}
