import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = session.user.email

  try {
    // Query all Signer records where email matches current user
    const signers = await prisma.signer.findMany({
      where: {
        email: userEmail,
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            status: true,
            driveFileId: true,
            createdAt: true,
            creator: {
              select: {
                name: true,
              },
            },
            signers: {
              select: {
                id: true,
                order: true,
                status: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        workflow: {
          createdAt: 'desc',
        },
      },
    })

    // Transform to response format
    const pending = []
    const signed = []

    for (const signer of signers) {
      // Calculate if it's user's turn
      const allSigners = signer.workflow.signers
      const unsignedSigners = allSigners.filter(s => s.status !== 'SIGNED')
      const lowestUnsignedOrder = unsignedSigners.length > 0
        ? Math.min(...unsignedSigners.map(s => s.order))
        : null
      const isYourTurn = signer.order === lowestUnsignedOrder

      const request = {
        id: signer.id,
        workflowId: signer.workflow.id,
        workflowStatus: signer.workflow.status,
        documentTitle: signer.workflow.name,
        drivePath: signer.workflow.name,
        requestedBy: signer.workflow.creator.name,
        requestedAt: new Date(signer.workflow.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        yourPosition: signer.order + 1, // 1-indexed for display
        totalSigners: allSigners.length,
        isYourTurn,
      }

      if (signer.status === 'SIGNED') {
        signed.push({
          ...request,
          status: 'signed' as const,
          signedAt: signer.signedAt
            ? new Date(signer.signedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) + ' at ' + new Date(signer.signedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : undefined,
        })
      } else {
        pending.push({
          ...request,
          status: 'pending' as const,
        })
      }
    }

    return NextResponse.json({ pending, signed })
  } catch (error) {
    console.error('Error fetching signature requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signature requests' },
      { status: 500 }
    )
  }
}
