import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDriveClient } from '@/lib/drive'
import { sendSignerNotification } from '@/lib/email'
import { writeAuditLog } from '@/lib/audit'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { Readable } from 'stream'

export async function GET() {
  // Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const userEmail = session.user.email

  try {
    // Query workflows where user is creator OR a signer
    const workflows = await prisma.workflow.findMany({
      where: {
        OR: [
          { creatorId: userId },
          {
            signers: {
              some: {
                email: userEmail,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        documentNumber: true,
        driveFileId: true,
        creator: {
          select: {
            name: true,
          },
        },
        signers: {
          select: {
            id: true,
            name: true,
            email: true,
            order: true,
            status: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workflows
 * Creates a new signing workflow with signers.
 *
 * Request body:
 * {
 *   name: string
 *   driveFileId: string
 *   driveFolderId?: string
 *   signers: Array<{ name: string, email: string, order: number }>
 *   retentionDate?: string (ISO date)
 *   notifyOnSign: boolean
 *   notifyOnComplete: boolean
 * }
 *
 * Response:
 * {
 *   workflowId: string
 *   documentNumber: string
 * }
 */
export async function POST(request: Request) {
  // 1. Check authentication
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Parse and validate request body
    const body = await request.json()
    const {
      name,
      driveFileId,
      driveFolderId,
      signers,
      retentionDate,
      notifyOnSign,
      notifyOnComplete,
    } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      )
    }

    if (!driveFileId || typeof driveFileId !== 'string') {
      return NextResponse.json(
        { error: 'Drive file ID is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(signers) || signers.length === 0) {
      return NextResponse.json(
        { error: 'At least one signer is required' },
        { status: 400 }
      )
    }

    // Validate signers array
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i]
      if (!signer.name || !signer.email) {
        return NextResponse.json(
          { error: `Signer at position ${i} is missing name or email` },
          { status: 400 }
        )
      }
      if (signer.order !== i) {
        return NextResponse.json(
          { error: `Signer order must be sequential starting from 0` },
          { status: 400 }
        )
      }
      // Basic email validation
      if (!signer.email.includes('@')) {
        return NextResponse.json(
          { error: `Invalid email for signer: ${signer.email}` },
          { status: 400 }
        )
      }
    }

    // 3. Fetch file metadata from Drive
    const drive = await getDriveClient(session.user.id)
    const fileMetadata = await drive.files.get({
      fileId: driveFileId,
      fields: 'id, name, mimeType',
    })

    if (!fileMetadata.data.name) {
      return NextResponse.json(
        { error: 'Could not fetch file metadata from Drive' },
        { status: 500 }
      )
    }

    // 4. Compute document hash by streaming from Drive
    // CRITICAL: We compute the hash here during creation, not via separate endpoint
    // The hash endpoint requires an existing workflow, but we're creating one now
    const fileResponse = await drive.files.get(
      { fileId: driveFileId, alt: 'media' },
      { responseType: 'stream' }
    )

    const hashInstance = createHash('sha256')
    const stream = fileResponse.data as Readable

    // Stream file and compute hash
    const documentHash = await new Promise<string>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        hashInstance.update(chunk)
      })

      stream.on('end', () => {
        resolve(hashInstance.digest('hex'))
      })

      stream.on('error', (error) => {
        console.error('Stream error while hashing file:', error)
        reject(new Error('Failed to compute document hash'))
      })
    })

    // 5. Get IP address and user agent for audit log
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    // 6. Create workflow and signers in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 6a. Generate unique document number: TL-YYYY-####
      // Use retry loop to handle concurrent requests and deleted workflows
      let documentNumber: string
      let attempts = 0

      while (true) {
        const year = new Date().getFullYear()
        const count = await tx.workflow.count({
          where: {
            documentNumber: { startsWith: `TL-${year}-` },
          },
        })
        const candidate = `TL-${year}-${(count + 1 + attempts).toString().padStart(4, '0')}`

        // Check if this number already exists
        const existing = await tx.workflow.findUnique({
          where: { documentNumber: candidate },
        })

        if (!existing) {
          documentNumber = candidate
          break
        }

        attempts++
        if (attempts > 100) {
          // Fallback to timestamp-based number if we can't find a sequential one
          documentNumber = `TL-${year}-${Date.now()}`
          break
        }
      }

      // 6b. Create workflow (DRAFT initially)
      const workflow = await tx.workflow.create({
        data: {
          name: name.trim(),
          status: 'DRAFT',
          creatorId: session.user.id,
          driveFileId,
          driveFolderId: driveFolderId ?? null,
          documentHash,
          documentNumber,
          retentionDate: retentionDate ? new Date(retentionDate) : null,
        },
      })

      // 6c. Create signers
      await tx.signer.createMany({
        data: signers.map((signer: { name: string; email: string; order: number }) => ({
          workflowId: workflow.id,
          email: signer.email.trim().toLowerCase(),
          name: signer.name.trim(),
          order: signer.order,
          status: 'PENDING',
        })),
      })

      // 6d. Write WORKFLOW_CREATED audit log
      await tx.auditLog.create({
        data: {
          workflowId: workflow.id,
          eventType: 'WORKFLOW_CREATED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            fileName: fileMetadata.data.name,
            signerCount: signers.length,
            notifyOnSign,
            notifyOnComplete,
          },
        },
      })

      // 6e. Set workflow status to ACTIVE
      await tx.workflow.update({
        where: { id: workflow.id },
        data: { status: 'ACTIVE' },
      })

      return workflow
    })

    // 7. Notify first signer (order = 0) after transaction commits
    const firstSigner = await prisma.signer.findFirst({
      where: {
        workflowId: result.id,
        order: 0,
      },
    })

    if (firstSigner) {
      const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${result.id}`

      const emailResult = await sendSignerNotification({
        to: firstSigner.email,
        signerName: firstSigner.name,
        workflowName: result.name,
        creatorName: session.user.name ?? session.user.email,
        signUrl,
        position: 0,
        total: signers.length,
      })

      if (emailResult.success) {
        // Update signer status to NOTIFIED
        await prisma.signer.update({
          where: { id: firstSigner.id },
          data: { status: 'NOTIFIED' },
        })

        // Write SIGNER_NOTIFIED audit log
        await writeAuditLog({
          workflowId: result.id,
          eventType: 'SIGNER_NOTIFIED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            signerId: firstSigner.id,
            signerEmail: firstSigner.email,
            signerOrder: 0,
          },
        })
      } else {
        console.error('Failed to send initial signer notification:', emailResult.error)
      }
    }

    // 8. Return success response
    return NextResponse.json(
      {
        workflowId: result.id,
        documentNumber: result.documentNumber,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create workflow:', error)

    // Handle specific Drive API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const driveError = error as { code: number }
      if (driveError.code === 404) {
        return NextResponse.json(
          { error: 'Drive file not found' },
          { status: 404 }
        )
      }
      if (driveError.code === 403) {
        return NextResponse.json(
          { error: 'Insufficient Drive permissions' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}
