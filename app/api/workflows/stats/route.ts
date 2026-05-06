import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Prevent static optimization
export const dynamic = 'force-dynamic'

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
    // Get start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 1. Active workflows created by me
    const activeWorkflows = await prisma.workflow.count({
      where: {
        creatorId: userId,
        status: 'ACTIVE',
      },
    })

    // 2. Awaiting signatures - where I am a signer with pending/notified/signing status
    const awaitingSignatures = await prisma.signer.count({
      where: {
        email: userEmail,
        status: {
          in: ['PENDING', 'NOTIFIED', 'SIGNING'],
        },
      },
    })

    // 3. Completed this month
    const completedThisMonth = await prisma.workflow.count({
      where: {
        creatorId: userId,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfMonth,
        },
      },
    })

    // 4. Your turn - where I am the current signer
    // Get all my signer records that haven't signed yet
    const myPendingSigners = await prisma.signer.findMany({
      where: {
        email: userEmail,
        status: {
          not: 'SIGNED',
        },
      },
      select: {
        id: true,
        workflowId: true,
        order: true,
      },
    })

    // For each workflow, check if I'm the signer with the lowest order among unsigned signers
    let yourTurn = 0
    for (const mySigner of myPendingSigners) {
      // Find the lowest order among unsigned signers in this workflow
      const lowestUnsignedSigner = await prisma.signer.findFirst({
        where: {
          workflowId: mySigner.workflowId,
          status: {
            not: 'SIGNED',
          },
        },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
        },
      })

      // If I am that signer, increment the count
      if (lowestUnsignedSigner?.id === mySigner.id) {
        yourTurn++
      }
    }

    return NextResponse.json({
      activeWorkflows,
      awaitingSignatures,
      completedThisMonth,
      yourTurn,
    })
  } catch (error) {
    console.error('Error fetching workflow stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow stats' },
      { status: 500 }
    )
  }
}
