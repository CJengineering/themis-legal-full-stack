import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { FieldType } from '@prisma/client'

interface FieldInput {
  signerId: string
  type: FieldType
  page: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * POST /api/workflows/[id]/fields
 * Saves signature field placements for a workflow.
 * Deletes existing fields and bulk inserts new ones.
 *
 * Authorization: Only workflow creator can place fields
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
    // 2. Parse request body
    const body = await request.json()
    const fields = body.fields as FieldInput[]

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'fields must be an array' },
        { status: 400 }
      )
    }

    // 3. Fetch workflow and verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        signers: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only workflow creator can place signature fields' },
        { status: 403 }
      )
    }

    // 4. Validate that every signer has at least one SIGNATURE field
    const signerIds = workflow.signers.map((s) => s.id)
    const signatureFieldsBySigner = new Map<string, number>()

    for (const field of fields) {
      if (!signerIds.includes(field.signerId)) {
        return NextResponse.json(
          { error: `Invalid signerId: ${field.signerId}` },
          { status: 400 }
        )
      }

      if (field.type === 'SIGNATURE') {
        signatureFieldsBySigner.set(
          field.signerId,
          (signatureFieldsBySigner.get(field.signerId) ?? 0) + 1
        )
      }
    }

    // Check each signer has at least 1 SIGNATURE field
    for (const signer of workflow.signers) {
      const sigCount = signatureFieldsBySigner.get(signer.id) ?? 0
      if (sigCount === 0) {
        return NextResponse.json(
          {
            error: `Signer "${signer.name}" must have at least one SIGNATURE field`,
            missingSignerId: signer.id,
          },
          { status: 400 }
        )
      }
    }

    // 5. Delete existing fields and insert new ones in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing fields
      await tx.signatureField.deleteMany({
        where: { workflowId },
      })

      // Bulk insert new fields
      const created = await tx.signatureField.createMany({
        data: fields.map((field) => ({
          workflowId,
          signerId: field.signerId,
          type: field.type,
          page: field.page,
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
        })),
      })

      // Update workflow status to ACTIVE if it was DRAFT
      if (workflow.status === 'DRAFT') {
        await tx.workflow.update({
          where: { id: workflowId },
          data: { status: 'ACTIVE' },
        })
      }

      return created
    })

    // 6. Write audit log
    const headersList = await headers()
    await writeAuditLog({
      workflowId,
      eventType: 'WORKFLOW_CREATED',
      actorId: session.user.id,
      ipAddress: headersList.get('x-forwarded-for') ?? 'unknown',
      userAgent: headersList.get('user-agent') ?? 'unknown',
      metadata: {
        fieldsPlaced: result.count,
        signerCount: workflow.signers.length,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error('Failed to save signature fields:', error)
    return NextResponse.json(
      { error: 'Failed to save signature fields' },
      { status: 500 }
    )
  }
}
